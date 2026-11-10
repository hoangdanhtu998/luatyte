# Danh sách liên kết

## Mục tiêu
- Hiểu danh sách liên kết là gì và khác mảng thế nào
- Biết mỗi nút chứa giá trị và địa chỉ nút kế tiếp
- Thêm một nút vào đầu danh sách, và đi qua cả danh sách

## Trước khi đọc: thử đoán
Ba số 1, 2, 3 được thêm vào đầu danh sách, lần lượt từng số. Khi in cả danh sách từ đầu, thứ tự là gì?

Viết đáp án ra giấy trước.

## Ý chính 1: mỗi nút là một toa tàu
Hình dung một đoàn tàu. Mỗi toa có hàng hóa (giá trị) và một móc nối chỉ đến toa kế tiếp (con trỏ `tiep`). Muốn đi hết đoàn tàu, bắt đầu từ toa đầu và đi theo móc nối.

## Ý chính 2: khác mảng ở đâu
Mảng là dãy ô nằm liền nhau. Danh sách liên kết thì các nút có thể nằm rải rác trong bộ nhớ. Muốn tìm nút thứ k, mảng nhảy thẳng tới ô đó, còn danh sách phải đi qua từng nút.

## Ý chính 3: thêm vào đầu
Khi thêm một nút mới vào đầu:
1. Xin một nút mới.
2. Cho nút mới trỏ tới đầu hiện tại.
3. Đặt đầu danh sách là nút mới.

## Bảng theo dõi
Thêm lần lượt 1, 2, 3 vào đầu:

| Bước | Thêm | Danh sách từ đầu |
|---|---|---|
| 1 | 1 | 1 |
| 2 | 2 | 2 → 1 |
| 3 | 3 | 3 → 2 → 1 |

Đáp án của phần đoán ở trên: `3 2 1`. Số thêm sau cùng nằm ở đầu.

## Ví dụ có code

```c
#include <stdio.h>
#include <stdlib.h>

struct Nut {
    int giatri;
    struct Nut *tiep;
};

int main(void) {
    struct Nut *dau = NULL;
    for (int i = 1; i <= 3; i++) {
        struct Nut *moi = malloc(sizeof *moi);
        moi->giatri = i;
        moi->tiep = dau;
        dau = moi;
    }
    for (struct Nut *p = dau; p != NULL; p = p->tiep) {
        printf("%d ", p->giatri);
    }
    printf("\n");
    return 0;
}
```

**Kết quả khi chạy:**
```
3 2 1
```

## Lỗi hay gặp
- Quên gán `moi->tiep = dau`, làm mất cả phần danh sách cũ.
- Đi qua danh sách bằng cách làm mất con trỏ, ví dụ gán `dau = dau->tiep` mà không giữ lại địa chỉ đầu.
- Quên `free` các nút khi xong việc, gây rò rỉ bộ nhớ.

## Tự kiểm tra
1. Thêm 5, 6 vào đầu danh sách rỗng, in ra thứ tự là gì?
2. Vì sao danh sách liên kết không cần các ô liền nhau?
3. Muốn tìm một số trong danh sách, phải làm gì?
