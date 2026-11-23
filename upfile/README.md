# GitPocket 1.3 · tải nhiều thư mục xuống ZIP

Ứng dụng tĩnh quản lý file GitHub, phát triển từ **`index.html` GitPocket** bạn cung cấp. Bản 1.3 thêm tải xuống nhiều thư mục/file trong một ZIP, bên cạnh xoá hàng loạt và hàng đợi tải lên kết hợp file lẻ với nhiều thư mục. Mã vẫn chia thành các thành phần, không cần backend hay bước build.

## Dùng các chức năng mới

### Tải nhiều thư mục xuống cùng lúc

1. Chọn kho, nhánh và mở thư mục đang làm việc.
2. Đánh dấu nhiều thư mục cần tải; có thể chọn thêm file lẻ. **Chọn tất cả** áp dụng cho các mục đang hiển thị. Các mục đã chọn nhưng đang ẩn bởi tìm kiếm vẫn được tính và ghi rõ trong tổng số.
3. Bấm **Tải xuống ZIP**. App đọc toàn bộ thư mục con, lấy nội dung file theo cùng một phiên bản và đóng gói thành một file ZIP.
4. Nếu trình duyệt chưa lưu tự động, bấm **Lưu ZIP** trong khung tiến độ. Có thể bấm lại liên kết này để lưu lại cùng ZIP.

ZIP giữ tên các thư mục đã chọn, tên tiếng Việt, cấu trúc con và nguyên byte của file nhị phân/file rỗng. Đường dẫn trong ZIP tính từ thư mục đang mở: ví dụ đang ở `assets`, chọn `icons` và `photos` thì ZIP chứa `icons/...` và `photos/...`.

Có tiến độ theo số file/dung lượng và nút **Huỷ tải xuống**. Nếu huỷ hoặc một file lỗi, app dừng cả lượt và không tạo ZIP thiếu nội dung. Có thể thử lại cùng lựa chọn. Liên kết ZIP trên giao diện được xoá khi làm mới, chuyển kho/nhánh/thư mục hoặc ngắt kết nối.

Tải xuống chỉ dùng yêu cầu đọc GitHub, hoạt động cả ở kho archived hoặc tài khoản chỉ có quyền xem. Token chỉ cần Contents: Read-only nếu bạn chỉ tải xuống. App không tạo commit hay sửa file khi tải xuống.

ZIP được đóng gói ngay trong trình duyệt bằng định dạng ZIP tiêu chuẩn, phương thức STORE; không nén lại dữ liệu nên dung lượng ZIP gần với tổng dung lượng file gốc.

### Xoá nhiều file hoặc thư mục

1. Chọn đúng kho, nhánh và thư mục đang làm việc.
2. Đánh dấu các file/thư mục cần xoá. **Chọn tất cả** chỉ chọn các mục đang hiển thị sau khi tìm kiếm. Nếu tìm kiếm ẩn các mục đã chọn trước đó, số mục đang ẩn được ghi rõ cạnh tổng số đã chọn; chúng vẫn nằm trong lần xoá.
3. Bấm **Xoá đã chọn**. App đọc đầy đủ nội dung thư mục con và hiển thị danh sách tất cả file sẽ bị xoá.
4. Kiểm tra kho, nhánh, đường dẫn và xác nhận. Một lần xoá hàng loạt được áp dụng bằng **một commit**. Nhánh thay đổi hoặc mục đã chọn đổi phiên bản sẽ làm thao tác dừng để bạn làm mới/chọn lại.

Cũng có thể bấm thùng rác ở từng dòng thư mục để xoá cả thư mục đó sau khi xem trước. **Bỏ chọn** xoá toàn bộ lựa chọn. Làm mới, đổi thư mục, nhánh hoặc kho sẽ xoá lựa chọn hiện tại.

### Tải file và nhiều thư mục cùng một lần

- Dùng **Thêm nhiều file** để chọn các file lẻ.
- Dùng **Thêm thư mục** nhiều lần để gom các thư mục khác nhau vào cùng hàng đợi; các file đã chọn trước đó được giữ lại.
- Trên máy tính, có thể chọn nhiều file và thư mục trong trình quản lý file, rồi **kéo thả tất cả cùng lúc** vào vùng tải lên.
- Hàng đợi chia thành nhóm **File lẻ** và từng **thư mục gốc**. Có thể bỏ một file, **Bỏ nhóm**, hoặc **Xoá danh sách chờ** trước khi tải.
- Kiểm tra thư mục nhận, rồi bấm tải một lần cho toàn bộ hàng đợi. Cấu trúc bên trong và tên thư mục gốc được giữ nguyên. App sẽ hỏi trước khi ghi đè file trên GitHub.

Hộp chọn file của hệ điều hành thường không cho chọn đồng thời file và thư mục trong một cửa sổ; hai nút thêm vào cùng danh sách khắc phục giới hạn đó. Một lần kéo thả có thể chứa cả hai. Yêu cầu ghi lên GitHub vẫn chạy tuần tự để tránh xung đột nhánh; một lần bấm tải có thể tạo nhiều commit.

Các file trùng đường dẫn hoặc xung đột file–thư mục trong hàng đợi bị từ chối kèm thông báo; app không âm thầm thay thế file đã chọn trước đó.

## Chạy trên máy

Cần Node.js 20 trở lên:

```sh
cd gitpocket
npm run dev
```

Mở **http://127.0.0.1:4173**. Chạy app không cần `npm install`: server dùng thư viện có sẵn của Node.js.

Hoặc dùng một server tĩnh bất kỳ, chẳng hạn:

```sh
python -m http.server 4173
```

**Không mở bằng cách nhấp đúp `index.html`**: bản tách file dùng ES modules và cần HTTP/HTTPS. Bản HTML một file cũ của bạn vẫn là một bản riêng.

## Các thành phần

```text
index.html                      Khung giao diện, biểu mẫu, hộp thoại
assets/css/
  base.css                      Biến màu, reset, quy tắc dùng chung
  app.css                       Giao diện app và các thành phần
  responsive.css                Quy tắc cho các kích thước màn hình
src/
  app.js                        Khởi tạo và nối các thành phần
  core/
    app-context.js              Trạng thái, nút điều khiển, thông báo
    config.js                   Giới hạn và cấu hình chung
    errors.js                   Lỗi GitHub và kết quả chưa xác định
    paths.js                    Kiểm tra, mã hoá đường dẫn và link kho
  components/
    dom.js                      Tạo phần tử, định dạng kích thước
    icons.js                    Biểu tượng SVG nội bộ
    confirmation.js             Hộp xác nhận dùng chung
  services/
    github-client.js            Gọi GitHub REST API
    connection-store.js         Nhớ/quên kết nối trên thiết bị
    directory-drop.js           Đọc cấu trúc thư mục kéo thả
    delete-plan.js              Duyệt cây Git để lập danh sách xoá đầy đủ
    upload-queue.js             Gom nhóm, kiểm tra trùng/xung đột đường dẫn
    git-tree.js                 Chọn đầy đủ mục trong một cây Git cố định
    download-plan.js            Phạm vi và giới hạn tải xuống trước khi đọc file
    download-archive.js         Tải blob theo SHA, tiến độ, huỷ và tạo ZIP
    zip-store.js                Ghi ZIP32/UTF-8/CRC32 bằng byte gốc
  features/
    connection.js               Kết nối, ngắt, khôi phục kết nối
    repository-browser.js       Chọn kho/nhánh, duyệt và tìm file
    uploads.js                  Hàng đợi, kiểm tra ghi đè, tải lên
    folders.js                  Tạo thư mục bằng .gitkeep
    delete-file.js              Xác nhận và xoá file
    delete-batch.js             Xem trước, xác nhận, xoá nhiều file/thư mục
    downloads.js                Tải xuống ZIP, huỷ và liên kết lưu lại
scripts/serve.mjs                Server tĩnh phục vụ phát triển
tests/                          Kiểm tra logic và luồng trình duyệt
docs/                           Kiến trúc và nội dung bàn chức năng sau
```

## Chức năng được giữ

- Kết nối GitHub bằng Personal Access Token, tuỳ chọn nhớ kết nối trên thiết bị.
- Chọn kho, mở kho bằng link, chọn nhánh, duyệt thư mục và tìm tên trong thư mục hiện tại.
- Chọn nhiều file, chọn cả thư mục hoặc kéo thả; giữ cấu trúc đường dẫn.
- Xác nhận trước khi ghi đè, dùng SHA của phiên bản cũ để GitHub kiểm tra xung đột.
- Tạo thư mục bằng `.gitkeep`, xác nhận xoá file và trở về thư mục cha khi cần.
- Hiển thị tiến độ; ngừng tải khi một file lỗi, không tự gửi lại thao tác ghi.

## Lỗi đã sửa

- Tắt thao tác ghi khi danh sách đã cũ, kho archived/disabled hoặc API báo tài khoản không có quyền push. GitHub vẫn quyết định quyền cuối cùng, bao gồm quyền token và bảo vệ nhánh.
- Khi chuyển kho/nhánh/thư mục thất bại, giữ đúng bộ kho–nhánh–đường dẫn–danh sách cũ. Không xoá hàng đợi trước khi chuyển thành công.
- Hỏi trước khi bỏ file đang chờ lúc chuyển kho hoặc nhánh; huỷ hoặc lỗi chuyển sẽ giữ danh sách chờ.
- Làm mới kho vốn rỗng sẽ đọc lại GitHub, để thấy các file vừa được tạo từ nơi khác.
- Xoá trạng thái kho rỗng, ghi chú và đường dẫn cũ khi ngắt kết nối.
- Phiên không bật ghi nhớ không cập nhật vị trí vào một kết nối cũ còn trong bộ nhớ nếu trình duyệt chặn xoá.
- Thêm thời gian chờ cho yêu cầu: 30 giây khi đọc, 60 giây khi ghi. Mất mạng, phản hồi ghi không rõ ràng hoặc lỗi máy chủ được đánh dấu “kết quả chưa xác định”; app không tự gửi lại và yêu cầu làm mới/kiểm tra trước khi tiếp tục.
- Kiểm tra tổng đường dẫn tải lên, chặn link kho có cổng lạ hoặc thông tin đăng nhập trong URL.

## Đưa lên GitHub Pages

1. Đưa **toàn bộ nội dung thư mục dự án** lên thư mục gốc của nhánh bạn dùng để xuất bản. Có thể bỏ `tests/`, `scripts/`, `docs/`, các file cấu hình npm và định dạng; cần giữ `index.html`, `.nojekyll`, `assets/`, `src/`.
2. Trong kho GitHub, vào **Settings → Pages → Deploy from a branch**, chọn nhánh và thư mục **`/ (root)`**.
3. Mở URL Pages sau khi GitHub triển khai xong.

Các đường dẫn tài nguyên đều tương đối (`./…`), dùng được cả với Pages ở dạng `https://ten.github.io/ten-kho/`. Không chỉ đưa riêng `index.html` lên như bản cũ.

Kết nối đã nhớ dùng cùng khoá `gitpocket.connection.v1`. Nếu mở ở **cùng origin** với bản cũ và dữ liệu còn tồn tại, app có thể khôi phục kết nối. Chuyển từ file cục bộ sang HTTPS hoặc đổi domain thì cần kết nối lại.

## Kiểm tra dành cho người phát triển

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run format:check
```

Nếu máy đã có Chromium ở `/usr/bin/chromium`, kiểm tra giao diện sẽ dùng sẵn trình duyệt đó; không cần cài lại. Có thể chỉ định trình duyệt qua `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

Kiểm tra trình duyệt chạy ở kích thước desktop và điện thoại. GitHub được giả lập hoàn toàn: không cần token thật và không tạo commit trong kho thật. Xem phạm vi kiểm tra trong [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Giới hạn

- Mỗi lượt tải xuống tối đa 5.000 mục (file và thư mục), 50 MB/file, tổng **nội dung file** tối đa 100 MB. Các giới hạn được kiểm tra trước khi tải nội dung để giới hạn bộ nhớ trình duyệt; có thể điều chỉnh trong `src/core/config.js`.
- Tải xuống đọc tối đa ba blob song song và dùng SHA cố định, nên một nhánh thay đổi giữa chừng không trộn các phiên bản vào ZIP. Cây Git không đầy đủ/bị `truncated` sẽ làm app dừng; không tải một phần thư mục rồi coi là hoàn tất.
- Submodule cần tải kho tương ứng riêng. File Git LFS cần lấy nội dung gốc bằng Git LFS. App báo rõ và dừng cả lượt thay vì âm thầm bỏ qua hoặc xuất file con trỏ. Symlink được lưu dưới dạng file văn bản chứa đường dẫn đích, không được theo tới đích hay xuất thành liên kết có thể trỏ ra ngoài ZIP.

- Tải lên: 25 MB/file, tải tuần tự, mỗi file là một commit riêng; nhiều file không tạo thành một giao dịch nguyên khối.
- Hàng đợi tải lên tối đa 5.000 file chưa hoàn tất. Một lần xoá hàng loạt tối đa 5.000 file; tất cả file trong các thư mục đã chọn đều tính vào giới hạn này.
- Contents API hiển thị tối đa 1.000 mục/thư mục. Danh sách kho và nhánh đọc tối đa 5 trang × 100 mục; có thể mở kho ngoài danh sách bằng link.
- Xoá thư mục dùng cây Git đầy đủ, không phụ thuộc giới hạn hiển thị 1.000 mục của Contents API. Nếu GitHub báo cây Git bị cắt bớt ở kho quá lớn, app từ chối xoá và không áp dụng một phần danh sách. Khi đó dùng GitHub hoặc Git để thực hiện lần xoá đó.
- Xoá hàng loạt tạo tree/commit rồi cập nhật nhánh với `force: false`. Các object chuẩn bị có thể tồn tại nếu cập nhật nhánh bị từ chối; nội dung nhánh chưa bị xoá một phần. Nếu mất kết nối khi cập nhật nhánh, cần làm mới và kiểm tra kết quả trước khi thử lại. Kho yêu cầu commit ký số hoặc quy tắc nhánh khác có thể từ chối thay đổi từ app.
- Hộp chọn thư mục cần trình duyệt hỗ trợ `webkitdirectory`; một số thiết bị không hỗ trợ. Kéo thả đọc tối đa 5.000 mục và 64 cấp.
- Khi chọn thư mục, trình duyệt thường bỏ qua thư mục rỗng. Kéo thả có thể đọc được thư mục rỗng và app thêm `.gitkeep`.
- App gọi trực tiếp `https://api.github.com`. Khi bật ghi nhớ, token lưu trong localStorage của origin đang mở; “Ngắt & quên mã” xoá kết nối trên thiết bị, không thu hồi token trên GitHub.
- Không thêm trình sửa file, đổi tên hay quản lý bản ghi cơ sở dữ liệu trong bản này.

Các hướng phát triển chỉ để bàn tiếp tại [docs/ROADMAP.md](docs/ROADMAP.md).
