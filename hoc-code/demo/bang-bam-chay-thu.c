#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

typedef struct Node {
    char *key;
    int value;
    struct Node *next;
} Node;

typedef struct {
    Node **buckets;
    size_t capacity;
    size_t size;
} HashTable;

static unsigned long hash(const char *str) {
    unsigned long h = 5381;
    int c;
    while ((c = (unsigned char)*str++))
        h = ((h << 5) + h) + c;
    return h;
}

HashTable *ht_create(size_t capacity) {
    HashTable *ht = malloc(sizeof(HashTable));
    if (ht == NULL) return NULL;
    ht->capacity = capacity;
    ht->size = 0;
    ht->buckets = calloc(capacity, sizeof(Node *));
    if (ht->buckets == NULL) { free(ht); return NULL; }
    return ht;
}

/* chèn không kiểm tra trùng và không rehash: dùng khi đã biết khóa chưa có */
static void insert_new(HashTable *ht, char *key_copy, int value) {
    size_t idx = hash(key_copy) % ht->capacity;
    Node *n = malloc(sizeof(Node));
    n->key = key_copy;
    n->value = value;
    n->next = ht->buckets[idx];
    ht->buckets[idx] = n;
    ht->size++;
}

static void ht_rehash(HashTable *ht) {
    size_t old_cap = ht->capacity;
    Node **old = ht->buckets;
    ht->capacity *= 2;
    ht->buckets = calloc(ht->capacity, sizeof(Node *));
    ht->size = 0;
    for (size_t i = 0; i < old_cap; i++) {
        Node *cur = old[i];
        while (cur) {
            Node *next = cur->next;
            insert_new(ht, cur->key, cur->value); /* chuyển nút sang bảng mới */
            free(cur);
            cur = next;
        }
    }
    free(old);
}

void ht_put(HashTable *ht, const char *key, int value) {
    size_t idx = hash(key) % ht->capacity;
    for (Node *cur = ht->buckets[idx]; cur; cur = cur->next) {
        if (strcmp(cur->key, key) == 0) { cur->value = value; return; }
    }
    insert_new(ht, strdup(key), value);
    if ((double)ht->size / ht->capacity > 0.75) ht_rehash(ht);
}

bool ht_get(HashTable *ht, const char *key, int *out) {
    size_t idx = hash(key) % ht->capacity;
    for (Node *cur = ht->buckets[idx]; cur; cur = cur->next) {
        if (strcmp(cur->key, key) == 0) { *out = cur->value; return true; }
    }
    return false;
}

bool ht_remove(HashTable *ht, const char *key) {
    size_t idx = hash(key) % ht->capacity;
    Node *cur = ht->buckets[idx], *prev = NULL;
    while (cur) {
        if (strcmp(cur->key, key) == 0) {
            if (prev) prev->next = cur->next;
            else ht->buckets[idx] = cur->next;
            free(cur->key);
            free(cur);
            ht->size--;
            return true;
        }
        prev = cur;
        cur = cur->next;
    }
    return false;
}

void ht_free(HashTable *ht) {
    for (size_t i = 0; i < ht->capacity; i++) {
        Node *cur = ht->buckets[i];
        while (cur) {
            Node *next = cur->next;
            free(cur->key);
            free(cur);
            cur = next;
        }
    }
    free(ht->buckets);
    free(ht);
}

int main(void) {
    HashTable *ht = ht_create(4);
    ht_put(ht, "Alice", 90);
    ht_put(ht, "Bob", 75);
    ht_put(ht, "Charlie", 60);
    ht_put(ht, "Bob", 80);          /* cập nhật, không thêm mới */
    int v;
    printf("size=%zu capacity=%zu\n", ht->size, ht->capacity);
    printf("Bob=%d\n", ht_get(ht, "Bob", &v) ? v : -1);
    printf("Zed=%d\n", ht_get(ht, "Zed", &v) ? v : -1);
    printf("remove Alice=%d\n", ht_remove(ht, "Alice"));
    printf("size=%zu\n", ht->size);

    HashTable *big = ht_create(2);
    char key[32];
    for (int i = 0; i < 100; i++) {
        snprintf(key, sizeof key, "k%d", i);
        ht_put(big, key, i * i);
    }
    int ok = 1;
    for (int i = 0; i < 100; i++) {
        snprintf(key, sizeof key, "k%d", i);
        if (!ht_get(big, key, &v) || v != i * i) ok = 0;
    }
    printf("100 keys ok=%d size=%zu capacity=%zu\n", ok, big->size, big->capacity);
    ht_free(ht);
    ht_free(big);
    return 0;
}
