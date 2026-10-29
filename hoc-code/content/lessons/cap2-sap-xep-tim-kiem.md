# Sắp xếp và tìm kiếm

## Ý chính
Dữ liệu có thứ tự giúp tìm nhanh hơn rất nhiều. Tìm nhị phân chia đôi phạm vi tìm kiếm ở mỗi bước.

## Tìm nhị phân
```c
int tim(const int a[], int n, int x) {
    int lo = 0, hi = n - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;   // tránh tràn số
        if (a[mid] == x) return mid;
        if (a[mid] < x) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}
```

## Độ phức tạp
| Thuật toán | Trung bình | Xấu nhất |
|---|---|---|
| Tìm tuyến tính | O(n) | O(n) |
| Tìm nhị phân | O(log n) | O(log n) |
| Sắp xếp chọn | O(n²) | O(n²) |
| Quicksort | O(n log n) | O(n²) |

## Lỗi hay gặp
- Dùng tìm nhị phân trên mảng chưa sắp xếp: kết quả sai mà không báo lỗi.
- Viết `(lo + hi) / 2`: có thể tràn số khi hai số đều lớn. Viết `lo + (hi - lo) / 2`.

## Tự kiểm tra
1. Tìm nhị phân cần điều kiện gì về mảng?
2. Độ phức tạp trung bình của tìm nhị phân là gì?
3. Sắp xếp ổn định nghĩa là gì?
