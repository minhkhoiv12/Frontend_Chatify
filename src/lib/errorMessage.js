const vietnameseMessages = new Set([
  "Vui lòng điền đầy đủ các trường thông tin",
  "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ thường, chữ hoa, chữ số và ký tự đặc biệt.",
  "Định dạng email không hợp lệ",
  "Email này đã được sử dụng",
  "Thông tin người dùng không hợp lệ",
  "Vui lòng nhập email và mật khẩu",
  "Email hoặc mật khẩu không chính xác",
  "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  "Vui lòng chọn ảnh đại diện",
  "Không thể tìm kiếm người dùng. Vui lòng thử lại.",
  "Vui lòng nhập nội dung hoặc chọn hình ảnh.",
  "Bạn không thể gửi tin nhắn cho chính mình.",
  "Không tìm thấy người nhận.",
]);

export const getUserErrorMessage = (error, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") => {
  const message = error?.response?.data?.message;
  return typeof message === "string" && vietnameseMessages.has(message) ? message : fallback;
};
