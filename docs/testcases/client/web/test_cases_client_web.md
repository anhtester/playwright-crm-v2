# Test Cases — `CLIENT` · Web — 10 TC

Phạm vi: các trang công khai của khu khách hàng trên `https://crm.anhtester.com`.
KHÔNG đăng nhập, KHÔNG bấm Login / Submit / Yes / No, KHÔNG đổi Language.

| TC ID | Test Scenario | Test Steps | Expected Result | Tags |
|---|---|---|---|---|
| CRM_CLIENT_TC_001 | Mở trang đăng nhập khách hàng thì thấy biểu mẫu đăng nhập | 1. Mở `/authentication/login` | Đúng URL, thẻ trình duyệt ghi `Please login`, thấy tiêu đề trang | @smoke, @ui |
| CRM_CLIENT_TC_002 | Biểu mẫu đăng nhập khách hàng đủ thành phần và đúng trạng thái mặc định | 1. Mở trang, không bấm gì | Language là English, danh sách có Vietnamese; con trỏ ở ô Email; Password che ký tự; Remember me chưa tick; nút Login bấm được; có link Forgot Password? | @smoke, @ui |
| CRM_CLIENT_TC_003 | Navbar có logo và đúng 2 mục menu theo thứ tự | 1. Mở trang đăng nhập<br>2. Nhìn navbar | Thấy logo; menu là Knowledge Base rồi Login; hai link trỏ đúng địa chỉ | @regression, @ui |
| CRM_CLIENT_TC_004 | Link Forgot Password? mở đúng trang Quên mật khẩu của khách hàng | 1. Bấm link Forgot Password?<br>2. Gõ một email giả, KHÔNG bấm Submit | Đúng URL và tiêu đề; đúng 1 ô nhập; có nút Submit; ô Email giữ giá trị vừa gõ | @smoke, @navigation |
| CRM_CLIENT_TC_005 | Mở thẳng URL khi chưa đăng nhập thì bị đưa về trang đăng nhập | Biến thể `a`: mở `/authentication/register`<br>Biến thể `b`: mở `/clients/` | Cả hai biến thể dừng ở trang đăng nhập khách hàng | @regression, @security |
| CRM_CLIENT_TC_006 | Đi lại giữa trang đăng nhập và Knowledge Base bằng navbar | 1. Bấm Knowledge Base<br>2. Bấm Login | Mỗi lần bấm tới đúng trang | @smoke, @navigation |
| CRM_CLIENT_TC_007 | Trang Knowledge Base có ô tìm kiếm và danh sách danh mục | 1. Mở `/knowledge-base` | Ô tìm kiếm gõ được, nút Search bấm được, có ít nhất 1 danh mục, link danh mục đúng mẫu `/knowledge-base/category/...` | @smoke, @ui |
| CRM_CLIENT_TC_008 | Tìm từ khoá không có bài viết nào thì báo không tìm thấy | 1. Gõ một từ khoá không tồn tại<br>2. Bấm Search | Hiện `No knowledge base articles found`; không có bài viết nào; ô tìm kiếm giữ từ khoá | @regression, @search |
| CRM_CLIENT_TC_009 | Mở danh mục đầu tiên thì tới đúng trang danh mục | 1. Bấm tên danh mục đầu tiên (đọc tên từ trang) | URL là link của danh mục; thẻ trình duyệt ghi tên danh mục | @regression, @navigation |
| CRM_CLIENT_TC_010 | Ba trang công khai không có lỗi JavaScript | 1. Mở lần lượt trang đăng nhập, Quên mật khẩu, Knowledge Base | Console của trình duyệt không ghi lỗi nào | @regression, @ui |
