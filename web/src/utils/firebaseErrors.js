const ERROR_MAP = {
  'auth/invalid-credential': 'Email hoặc mật khẩu chưa chính xác.',
  'auth/wrong-password': 'Mật khẩu chưa chính xác.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/email-already-in-use': 'Email này đã được đăng ký trước đó.',
  'auth/weak-password': 'Mật khẩu cần có ít nhất 6 ký tự.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.',
  'auth/popup-closed-by-user': 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.',
  'auth/cancelled-popup-request': 'Yêu cầu đăng nhập đã bị hủy.',
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền.',
  'auth/user-disabled': 'Tài khoản này hiện đang bị tạm khóa.',
};

export function getFirebaseErrorMessage(error, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.') {
  if (!error) return fallback;
  const code = error.code || '';
  if (ERROR_MAP[code]) return ERROR_MAP[code];
  const msg = String(error.message || '');
  for (const [key, viText] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return viText;
  }
  return msg || fallback;
}
