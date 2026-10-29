# Bảng băm (Hash Table)

**Cấp 1 · Bài 2 · 50 phút**

---

## Tóm tắt trong 1 phút
- Bảng băm biến **khóa** (ví dụ tên) thành **số ô** trong mảng. Nhờ vậy cất và tìm rất nhanh.
- Hai khóa có thể rơi vào cùng một ô, gọi là **va chạm**. Cách dùng ở đây: mỗi ô là một danh sách nối.
- Khi bảng quá đầy, mở rộng gấp đôi và băm lại mọi khóa. Gọi là **rehash**.

---

## Bước 1: Từ khóa đến số ô

Mảng cho phép tìm nhanh theo số thứ tự. Nhưng khóa là chữ thì không có số thứ tự.

Hàm băm biến khóa thành một số, rồi lấy phần dư để có số ô:

```
ô = hash(khóa) % dung_luong
```

Hàm băm tốt phải:
- Chạy nhanh.
- Cùng khóa luôn ra cùng số.
- Rải các khóa khác nhau đều trên các ô.

---

## Bước 2: Hàm băm djb2

```c
static unsigned long hash(const char *str) {
    unsigned long h = 5381;
    int c;
    while ((c = (unsigned char)*str++))
        h = ((h << 5) + h) + c;   /* h = h * 33 + c */
    return h;
}
```

---

## Bước 3: Va chạm và danh sách nối

Hai khóa khác nhau có thể ra cùng một ô. Lúc này ta không ghi đè. Ta nối thêm một nút vào danh sách của ô đó.

```
ô 0 → Alice → Bob → NULL
ô 1 → NULL
ô 2 → Charlie → NULL
```

Tìm một khóa thì đi đúng ô, rồi duyệt danh sách của ô đó.

---

## Bước 4: Cấu trúc dữ liệu

```c
typedef struct Node {
    char *key;           /* khóa */
    int value;           /* giá trị */
    struct Node *next;   /* nút kế tiếp trong cùng ô */
} Node;

typedef struct {
    Node **buckets;      /* mảng các con trỏ tới danh sách */
    size_t capacity;     /* số ô */
    size_t size;         /* số cặp khóa-giá trị */
} HashTable;
```

---

## Bước 5: Thêm và cập nhật (put)

```c
void ht_put(HashTable *ht, const char *key, int value) {
    size_t idx = hash(key) % ht->capacity;
    for (Node *cur = ht->buckets[idx]; cur; cur = cur->next) {
        if (strcmp(cur->key, key) == 0) { cur->value = value; return; }  /* đã có: cập nhật */
    }
    insert_new(ht, strdup(key), value);                 /* chưa có: thêm nút mới */
    if ((double)ht->size / ht->capacity > 0.75) ht_rehash(ht);
}
```

`insert_new` là hàm nhỏ chèn một nút vào đầu danh sách. Mã đầy đủ có trong ví dụ bên dưới.

---

## Bước 6: Tìm (get) và xóa (remove)

Cả hai đều bắt đầu như put: tính ô, rồi duyệt danh sách của ô đó.

- **get:** tìm được thì trả về giá trị. Không tìm được thì trả về `false`.
- **remove:** tìm được thì nối nút trước với nút sau, rồi giải phóng nút. Phải giải phóng cả `key`.

---

## Bước 7: Băm lại (rehash)

**Hệ số tải** = số khóa / số ô. Khi hệ số tải lớn hơn 0,75, danh sách mỗi ô dài ra và tìm chậm.

Khi đó ta làm ba việc:
1. Tạo mảng ô mới gấp đôi.
2. Chuyển từng nút sang mảng mới, băm lại khóa.
3. Giải phóng mảng cũ.

Chú ý: khi chuyển nút, không gọi `ht_put` nữa, vì `ht_put` có thể lại gọi rehash. Dùng `insert_new` để chèn trực tiếp.

---

## Bước 8: Chạy thử

Ví dụ dưới đã biên dịch với `gcc -std=c11 -Wall -Wextra -Werror` và chạy thật:

```c
HashTable *ht = ht_create(4);
ht_put(ht, "Alice", 90);
ht_put(ht, "Bob", 75);
ht_put(ht, "Charlie", 60);
ht_put(ht, "Bob", 80);          /* cập nhật Bob */
```

Kết quả:

```
size=3 capacity=4
Bob=80
Zed=-1
remove Alice=1
size=2
100 keys ok=1 size=100 capacity=256
```

Đọc kết quả:
- Thêm 3 khóa vào bảng 4 ô: hệ số tải là 0,75, chưa lớn hơn 0,75 nên chưa rehash.
- `Bob` được cập nhật, không tạo thêm nút. Size vẫn là 3.
- Thêm 100 khóa vào bảng bắt đầu chỉ có 2 ô: bảng tự mở rộng đến 256 ô.

Mã đầy đủ (gồm `insert_new`, `ht_rehash`, `ht_remove`, `ht_free`) nằm ở file `demo/bang-bam-chay-thu.c`. Biên dịch bằng `gcc -std=c11 -Wall -Wextra -Werror bang-bam-chay-thu.c` rồi chạy.

---

## Ba lỗi hay gặp

1. **Quên `free`** khóa (`strdup`) và nút khi xóa hoặc giải phóng bảng: rò rỉ bộ nhớ.
2. **Không kiểm tra `NULL`** sau `malloc`, `calloc` hoặc `strdup`.
3. **Hàm băm kém:** mọi khóa rơi vào một ô, tìm chậm như danh sách thường.

---

## Tự kiểm tra
1. Vì sao hai khóa khác nhau có thể cùng một ô?
2. Vì sao khi rehash không gọi `ht_put`?
3. Hệ số tải 0,8 có kích hoạt rehash không? Vì sao?

## Tổng kết
- Hàm băm biến khóa thành số ô.
- Va chạm: mỗi ô là một danh sách nối.
- Hệ số tải trên 0,75 thì rehash: mở rộng gấp đôi và băm lại.
