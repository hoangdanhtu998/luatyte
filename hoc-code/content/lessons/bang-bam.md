# Bảng băm (Hash Table)

**Cấp 1 · Bài 2 · 50 phút**

---

## Tóm tắt trong 1 phút
- Bảng băm biến tên (khóa) thành số ngăn (chỉ số mảng), để cất và tìm rất nhanh.
- Hai khóa có thể ra cùng một ngăn gọi là va chạm. Cách hay dùng: mỗi ngăn là một danh sách nối (chaining).
- Khi bảng quá đầy, phải rehash: tạo bảng lớn hơn rồi chuyển dữ liệu sang.
- Ứng dụng: từ điển, bộ nhớ đệm, đếm số lần xuất hiện. Tìm trung bình rất nhanh, gọi là O(1).

## 1. Vấn đề: Tìm nhanh O(1)

Mảng cho phép truy cập phần tử bằng chỉ số trong O(1). Nhưng nếu *khóa* không phải là số nguyên liên tiếp (ví dụ: tên người, mã sinh viên, từ điển), sao tìm nhanh?

**Ý tưởng:** Biến khóa thành chỉ số mảng bằng *hàm băm* (hash function).

---

## 2. Hàm băm

Hàm băm nhận khóa (key) trả về chỉ số mảng (index):

```
index = hash(key) % capacity
```

**Yêu cầu hàm băm tốt:**
- Nhanh (O(1))
- Phân bố đều: khóa khác nhau rải đều các ô
- Xác định: cùng khóa luôn ra cùng index

**Ví dụ đơn giản cho chuỗi (djb2):**

```c
unsigned long hash(const char *str) {
    unsigned long h = 5381;
    int c;
    while ((c = *str++))
        h = ((h << 5) + h) + c;  // h * 33 + c
    return h;
}
```

---

## 3. Va chạm (Collision)

Hai khóa khác nhau có thể băm ra cùng một index. Hai cách xử lý chính:

### A. Chaining (Nối danh sách) — *Dùng trong bài này*
Mỗi ô mảng lưu **con trỏ đầu** của một danh sách liên kết. Khóa trùng index → thêm nút vào danh sách.

```
bucket[0] → Node("Alice") → Node("Bob") → NULL
bucket[1] → NULL
bucket[2] → Node("Charlie") → NULL
...
```

### B. Open Addressing (Dò tuyến tính)
Nếu ô bị chiếm → nhảy sang ô tiếp theo (index+1, index+2...). Không dùng con trỏ nhưng phức tạp hơn khi xóa.

---

## 4. Cấu trúc dữ liệu

```c
typedef struct Node {
    char *key;           // khóa (chuỗi)
    int value;           // giá trị
    struct Node *next;   // nút tiếp theo trong chuỗi
} Node;

typedef struct {
    Node **buckets;      // mảng con trỏ Node*
    size_t capacity;     // số bucket
    size_t size;         // số cặp key-value hiện có
} HashTable;
```

---

## 5. Các thao tác cơ bản

### Khởi tạo
```c
HashTable *ht_create(size_t capacity) {
    HashTable *ht = malloc(sizeof(HashTable));
    ht->capacity = capacity;
    ht->size = 0;
    ht->buckets = calloc(capacity, sizeof(Node*));  // calloc = zero-initialized
    return ht;
}
```

### Chèn / Cập nhật (put)
```c
void ht_put(HashTable *ht, const char *key, int value) {
    size_t idx = hash(key) % ht->capacity;
    Node *cur = ht->buckets[idx];

    // Tìm key đã tồn tại → cập nhật value
    while (cur) {
        if (strcmp(cur->key, key) == 0) {
            cur->value = value;
            return;
        }
        cur = cur->next;
    }

    // Chưa có → tạo nút mới, chèn đầu danh sách
    Node *new_node = malloc(sizeof(Node));
    new_node->key = strdup(key);  // copy chuỗi
    new_node->value = value;
    new_node->next = ht->buckets[idx];
    ht->buckets[idx] = new_node;
    ht->size++;
}
```

### Tìm (get)
```c
bool ht_get(HashTable *ht, const char *key, int *out_value) {
    size_t idx = hash(key) % ht->capacity;
    Node *cur = ht->buckets[idx];

    while (cur) {
        if (strcmp(cur->key, key) == 0) {
            *out_value = cur->value;
            return true;
        }
        cur = cur->next;
    }
    return false;  // không tìm thấy
}
```

### Xóa (remove)
```c
bool ht_remove(HashTable *ht, const char *key) {
    size_t idx = hash(key) % ht->capacity;
    Node *cur = ht->buckets[idx];
    Node *prev = NULL;

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
```

### Giải phóng toàn bộ
```c
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
```

---

## 6. Load Factor & Rehash

**Load factor** = `size / capacity`. Khi load factor lớn (ví dụ > 0.75), danh sách ở mỗi bucket dài ra → tìm chậm.

**Giải pháp:** Tạo mảng bucket mới gấp đôi, băm lại tất cả key (rehash).

```c
void ht_rehash(HashTable *ht) {
    size_t old_cap = ht->capacity;
    Node **old_buckets = ht->buckets;

    ht->capacity *= 2;
    ht->buckets = calloc(ht->capacity, sizeof(Node*));
    ht->size = 0;

    for (size_t i = 0; i < old_cap; i++) {
        Node *cur = old_buckets[i];
        while (cur) {
            ht_put(ht, cur->key, cur->value);  // băm lại vào mảng mới
            Node *tmp = cur;
            cur = cur->next;
            free(tmp->key);
            free(tmp);
        }
    }
    free(old_buckets);
}
```

Trong `ht_put`, sau khi chèn xong: `if ((double)ht->size / ht->capacity > 0.75) ht_rehash(ht);`

---

## 7. Ứng dụng thực tế

- **Bộ nhớ đệm (cache):** Redis, Memcached dùng hash table
- **Trình biên dịch:** Bảng ký hiệu (symbol table) tra cứu tên biến/hàm
- **Cơ sở dữ liệu:** Index băm cho tra cứu khóa chính
- **Bộ gõ tiếng Việt:** Từ điển chữ -> mã, tra cứu O(1)
- **Bản đồ (map) trong ngôn ngữ cao cấp:** Python `dict`, Go `map`, C++ `unordered_map` đều là hash table

---

## 8. Ba lỗi thường gặp

1. **Quên free key** khi xóa hoặc free bảng → rò rỉ bộ nhớ
2. **Không check NULL** sau `malloc`/`calloc`/`strdup`
3. **Hash function kém** → tất cả key rơi vào 1 bucket → O(n) thay vì O(1)

---

## 9. Tóm tắt

| Khái niệm | Ý nghĩa |
|-----------|---------|
| Hash function | Biến key thành index |
| Bucket | Một ô trong mảng hash table |
| Chaining | Nối các key trùng index thành danh sách |
| Load factor | `size / capacity`, ngưỡng rehash thường 0.75 |
| Rehash | Mở rộng mảng, băm lại tất cả key |

**Bài tập:** Xây hash table chaining với put/get/remove, test với 1000 key ngẫu nhiên, in load factor trước/sau rehash.