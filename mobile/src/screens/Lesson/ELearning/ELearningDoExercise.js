/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';

const questions = [
  {
    id: 1,
    question: [
      {
        text: "Uống nước: Sự thừa hưởng hoặc sử dụng những thành quả lao động về …… và tinh thần của các thế hệ trước.",
        answers: [
          { id: 1, text: "vật chất", isCorrect: true },
          { id: 2, text: "sức khỏe", isCorrect: false },
          { id: 3, text: "tâm linh", isCorrect: false },
          { id: 4, text: "tinh thần", isCorrect: false },
        ],
      },
      {
        text: "Đình thường là nơi thờ cúng",
        answers: [
          { id: 1, text: "Thần Tài", isCorrect: false },
          { id: 2, text: "Ngũ Hành Nương Nương", isCorrect: false },
          { id: 3, text: "Thành Hoàng làng", isCorrect: true },
          { id: 4, text: "Phật", isCorrect: false },
        ],
      },
      {
        text: "Tại thành phố Hồ Chí Minh, quận huyện có nhiều đình nhất là",
        answers: [
          { id: 1, text: "Tân Bình", isCorrect: false },
          { id: 2, text: "Phú Nhuận", isCorrect: true },
          { id: 3, text: "Hóc Môn", isCorrect: false },
          { id: 4, text: "Sai", isCorrect: false },
        ],
      },
      {
        text: "Theo Sở Văn hoá và Thể thao Thành phố Hồ Chí Minh, hiện nay, Thành phố Hồ Chí Minh có bao nhiêu đình được Bộ Văn hoá, Thể thao và Du lịch, Ủy ban Nhân dân Thành phố xếp hạng di tích?",
        answers: [
          { id: 1, text: "33", isCorrect: false },
          { id: 2, text: "43", isCorrect: false },
          { id: 3, text: "53", isCorrect: true },
          { id: 4, text: "63", isCorrect: false },
        ],
      },
      {
        text: "Nhận định nào sau đâu là ý nghĩa trong tín ngưỡng thờ Thành Hoàng làng?",
        answers: [
          { id: 1, text: "Thể hiện lòng biết ơn những người có công với làng xã.", isCorrect: true },
          { id: 2, text: "Tổ chức các lễ hội phục vụ cho hoạt động du lịch.", isCorrect: false },
          { id: 3, text: "Cầu mong tài lộc cho làng.", isCorrect: false },
          { id: 4, text: "Cầu mong “mưa thuận gió hòa” cho làng.", isCorrect: false },
        ],
      },
      {
        text: "Trong tín ngưỡng thờ Thành Hoàng làng, lễ Kỳ Yên có tên gọi là",
        answers: [
          { id: 1, text: "lễ cầu an", isCorrect: true },
          { id: 2, text: "tế lễ", isCorrect: false },
          { id: 3, text: "lễ giỗ Tổ", isCorrect: false },
          { id: 4, text: "lễ hội làng", isCorrect: false },
        ],
      },
      {
        text: "Quận huyện nào có nhiều miếu nhất tại thành phố Hồ Chí Minh?",
        answers: [
          { id: 1, text: "Quận 3", isCorrect: false },
          { id: 2, text: "Cần Giờ", isCorrect: false },
          { id: 3, text: "Hóc Môn", isCorrect: false },
          { id: 4, text: "Bình Chánh", isCorrect: true },
        ],
      },
      {
        text: "Thành phố Hồ Chí Minh hiện có bao nhiêu ngôi đình còn đang hoạt động tín ngưỡng?",
        answers: [
          { id: 1, text: "199", isCorrect: false },
          { id: 2, text: "299", isCorrect: true },
          { id: 3, text: "53", isCorrect: false },
          { id: 4, text: "297", isCorrect: false },
        ],
      },
      {
        text: "Trong lễ Kỳ Yên, phần nghi thức lễ được tiến hành trang trọng, sau phần lễ là",
        answers: [
          { id: 1, text: "phần lộc", isCorrect: false },
          { id: 2, text: "cầu mưa", isCorrect: false },
          { id: 3, text: "phần hội", isCorrect: true },
          { id: 4, text: "nghỉ ngơi", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 2,
    question: [
      {
        text: "Câu 1. Ý nào sau đây không phải là vai trò của ngành thương mại?",
        answers: [
          { id: 1, text: "Thúc đẩy quá trình phân công lao động xã hội", isCorrect: false },
          { id: 2, text: "Đẩy mạnh chuyên môn hóa và hợp tác sản xuất", isCorrect: false },
          { id: 3, text: "Tăng giá trị xuất, nhập khẩu, thu hút vốn đầu tư nước ngoài", isCorrect: false },
          { id: 4, text: "Không mở rộng hợp tác với các vùng và các nước khác trên thế giới", isCorrect: true },
        ],
      },
      {
        text: "Câu 2. Nhận định nào sau đây không phải là vai trò của nội thương thành phố Hồ Chí Minh?",
        answers: [
          { id: 1, text: "Góp phần ổn định thị trường trong thành phố.", isCorrect: false },
          { id: 2, text: "Thúc đẩy sản xuất nội địa phát triển", isCorrect: false },
          { id: 3, text: "Duy trì tập quán tiêu dùng cũ", isCorrect: true },
          { id: 4, text: "Góp phần hình thành thị trường thống nhất.", isCorrect: false },
        ],
      },
      {
        text: "Câu 3. Ý nào sau đây là vai trò của ngoại thương Thành phố Hồ Chí Minh?",
        answers: [
          { id: 1, text: "Đáp ứng được nhu cầu xuất – nhập khẩu hàng hóa, nguyên liệu, công nghệ", isCorrect: true },
          { id: 2, text: "Thúc đẩy sản xuất nội địa phát triển.", isCorrect: false },
          { id: 3, text: "Góp phần hình thành thị trường thống nhất", isCorrect: false },
          { id: 4, text: "Góp phần ổn định thị trường trong thành phố", isCorrect: false },
        ],
      },
      {
        text: "Câu 4. Sinh thời, Chủ tịch Hồ Chí Minh khẳng định: “Thương nghiệp là ….. giữa nông nghiệp và công nghiệp. Thương nghiệp đưa hàng đến nông thôn phục vụ nông dân, thương nghiệp lại đưa nông sản, nguyên liệu cho thành thị tiêu dùng.”",
        answers: [
          { id: 1, text: "bàn đạp", isCorrect: false },
          { id: 2, text: "cầu nối", isCorrect: false },
          { id: 3, text: "cái khâu", isCorrect: true },
          { id: 4, text: "điểm tựa", isCorrect: false },
        ],
      },
      {
        text: "Câu 5. Một trong những yếu tố quan trọng góp phần làm cho thành phố Hồ Chí Minh trở thành trung tâm thương mại lớn nhất cả nước là do Thành phố Hồ Chí Minh nằm ở",
        answers: [
          { id: 1, text: "vùng kinh tế trọng điểm phía Nam", isCorrect: true },
          { id: 2, text: "vùng kinh tế trọng điểm Tây Nam Bộ.", isCorrect: false },
          { id: 3, text: "vùng kinh tế trọng điểm phía Bắc", isCorrect: false },
          { id: 4, text: "vùng kinh tế trọng điểm miền Trung", isCorrect: false },
        ],
      },
      {
        text: "Câu 6. Thành phố Hồ Chí Minh nằm ở đầu mối trung chuyển hàng hóa và nguyên liệu giữa các tỉnh vùng",
        answers: [
          { id: 1, text: "Tây Nguyên và Đồng bằng sông Hồng.", isCorrect: false },
          { id: 2, text: "Bắc Trung Bộ và Đồng bằng sông Cửu Long.", isCorrect: false },
          { id: 3, text: "Tây Nguyên và Đồng bằng sông Cửu Long.", isCorrect: true },
          { id: 4, text: "Tây Nguyên và Bắc Trung Bộ.", isCorrect: false },
        ],
      },
      {
        text: "Câu 7. Cơ chế chính sách: là nhân tố	để phát triển ngành thương mại, tạo môi trường thuận lợi thúc đẩy đầu tư thương mại phát triển, tạo hành lang	quan trọng để thừa nhận các hình thức giao dịch thương mại và bảo vệ người tiêu dùng.",
        answers: [
          { id: 1, text: "quan trọng, pháp luật", isCorrect: false },
          { id: 2, text: "quan trọng, pháp lí", isCorrect: true },
          { id: 3, text: "chủ đạo, pháp lí", isCorrect: false },
          { id: 4, text: "cơ sở và pháp luật", isCorrect: false },
        ],
      },
      {
        text: "Câu 8. Ở thành phố Hồ Chí Minh mặt hàng nhập khẩu chủ yếu là",
        answers: [
          { id: 1, text: "dệt may, nông sản, thủy hải sản", isCorrect: false },
          { id: 2, text: "máy tính, điện tử và linh kiện", isCorrect: false },
          { id: 3, text: "máy móc, thiết bị, nguyên nhiên liệu", isCorrect: true },
          { id: 4, text: "đồ gỗ, may mặc, xe ô tô", isCorrect: false },
        ],
      },
      {
        text: "Câu 9. Thành phố Hồ Chí Minh đứng thứ mấy ở nước ta về ứng dựng khoa học công nghệ trong ngành thương mại?",
        answers: [
          { id: 1, text: "Thứ nhất", isCorrect: true },
          { id: 2, text: "Thứ hai", isCorrect: false },
          { id: 3, text: "Thứ ba", isCorrect: false },
          { id: 4, text: "Thứ tư", isCorrect: false },
        ],
      },
      {
        text: "Câu 10. Mặt hàng xuất khẩu chiếm tỉ trọng lớn ở thành phố Hồ Chí Minh là",
        answers: [
          { id: 1, text: "dệt may, nông sản, thủy hải sản", isCorrect: false },
          { id: 2, text: "máy tính, điện tử và linh kiện", isCorrect: true },
          { id: 3, text: "máy móc, thiết bị, nguyên nhiên liệu", isCorrect: false },
          { id: 4, text: "dầu thô, gạo, cà phê", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 4,
    question: [
      {
        text: "Câu 1.  Hiện thực lịch sử là gì?",
        answers: [
          { id: 1, text: "A. Là tất cả những gì diễn ra trong quá khứ tồn tại một cách khách quan, độc lập ", isCorrect: true },
          { id: 2, text: "B. Là tất cả những gì diễn ra trong quá khứ của loài người", isCorrect: false },
          { id: 3, text: "C. Là tất cả những gì diễn ra trong quá khứ mà con người nhận thức được.", isCorrect: false },
          { id: 4, text: "D Là khoa học tìm hiểu về quá khứ", isCorrect: false },
        ],
      },
      {
        text: "Câu 2. Giáo dục tư tưởng, tình cảm, đạo đức và rút ra bài học kinh nghiệm hiện tại là chức năng nào của sử học?",
        answers: [
          { id: 1, text: "A. Chức năng xã hội.", isCorrect: false },
          { id: 2, text: "B. Chức năng khoa học.", isCorrect: false },
          { id: 3, text: "C. Chức năng giáo dục.", isCorrect: true },
          { id: 4, text: "D. Chức năng dự báo", isCorrect: false },
        ],
      },
      {
        text: "Câu 3. Nội dung nào sau đây không phải là lí do cần học tập lịch sử suốt đời?",
        answers: [
          { id: 1, text: "A. Cần vận dụng tri thức lịch sử vào cuộc sống.", isCorrect: false },
          { id: 2, text: "B. Cần bỏ qua quá khứ để hướng tới tương lai.", isCorrect: true },
          { id: 3, text: "C. Lịch sử còn nhiều bí ẩn cần khám phá.", isCorrect: false },
          { id: 4, text: "D. Giúp chung ta chung sống với thế giới.", isCorrect: false },
        ],
      },
      {
        text: "Câu 4. Ý nào sau đây không phản ánh đúng nguyên tắc cơ bản trong nghiên cứu lịch sử?",
        answers: [
          { id: 1, text: "A. Tiến bộ", isCorrect: false },
          { id: 2, text: "B. Vì người lao động", isCorrect: true },
          { id: 3, text: "C. Trung thực", isCorrect: false },
          { id: 4, text: "D. Khách quan", isCorrect: false },
        ],
      },
      {
        text: "Câu 5.  Ý nào sau đây không phải là đối tượng nghiên cứu của Sử học",
        answers: [
          { id: 1, text: "A. Quá khứ của toàn thể nhân loại", isCorrect: false },
          { id: 2, text: "B. Quá khứ của một quốc gia hoặc khu vực trên thế giới.", isCorrect: false },
          { id: 3, text: "C. Quá khứ của một cá nhân hoặc một nhóm, một cộng đồng người.", isCorrect: false },
          { id: 4, text: "D. Những hiện tượng tự nhiên xảy ra trong quá khứ.", isCorrect: true },
        ],
      },
      {
        text: "Câu 6. So với hiện thức lịch sử, nhận thức lịch sử có đặc điểm gì?",
        answers: [
          { id: 1, text: "A. Nhận thức lịch sử luôn phản ánh đúng hiện thực lịch sử.", isCorrect: false },
          { id: 2, text: "B . Nhận thức lịch sử không thể tái hiện đầy đủ hiện thực lịch sử.", isCorrect: true },
          { id: 3, text: "C. Nhận thức lịch sử thường lạc hậu hơn hiện thực lịch sử.", isCorrect: false },
          { id: 4, text: "D. Nhận thức lịch sử độc lập, khách quan với hiện thực lịch sử.", isCorrect: false },
        ],
      },
      {
        text: "Câu 7. Hiểu biết sâu sắc về lịch sử và văn hóa dân tộc Việt Nam, của các nước trong khu vực và thế giới sẽ tạo ra cơ hội nào sau đây?",
        answers: [
          { id: 1, text: "A. Định hướng nghề nghiệp.", isCorrect: false },
          { id: 2, text: "B. Hiểu biết về tương lai.", isCorrect: false },
          { id: 3, text: "C. Hợp tác về kinh tế", isCorrect: false },
          { id: 4, text: "D. Hội nhập thành công", isCorrect: true },
        ],
      },
      {
        text: "Câu 8. Khái niệm lịch sử gắn liền với hai yếu tố cơ bản là",
        answers: [
          { id: 1, text: "A. Sử học và Toán học", isCorrect: false },
          { id: 2, text: "B. hiện thực lịch sử và nhận thức lịch sử.", isCorrect: true },
          { id: 3, text: "C. nhận thức lịch sử và đối tượng sử học.", isCorrect: false },
          { id: 4, text: "D. con người và thiên nhiên.", isCorrect: false },
        ],
      },
      {
        text: "Câu 9. Ý nào phản ánh đúng khái niệm nhận thức lịch sử?",
        answers: [
          { id: 1, text: "A. Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc Lập (2-9-1945).", isCorrect: false },
          { id: 2, text: "B. Ngày 1/9/1939, phát xít Đức tấn công Ba Lan.", isCorrect: false },
          { id: 3, text: "C. Tìm thấy xương hóa thạch con người ở Lạng Sơn.", isCorrect: false },
          { id: 4, text: "D. Có ý kiến cho rằng Mĩ thả bom xuống Hiroshima là cần thiết.", isCorrect: true },
        ],
      },
      {
        text: "Câu 10. Nội dung nào phản ánh không đúng khi nói đến sự cần thiết của việc học tập và khám phá lịch sử hiện nay?",
        answers: [
          { id: 1, text: "A. Học tập lịch sử chỉ diễn ra khi còn ngồi trên ghế nhà trường.", isCorrect: true },
          { id: 2, text: "B. Học tập lịch sử diễn ra mọi lúc, mọi nơi trong cuộc sống.", isCorrect: false },
          { id: 3, text: "C. Học tập lịch sử thông qua tham quan di tích, bảo tàng lịch sử.", isCorrect: false },
          { id: 4, text: "D. Học tập lịch sử thông qua phim ảnh, âm nhạc, truyện kể.", isCorrect: false },
        ],
      },
    ],
  },
  {
    id: 5,
    question: [
      {
        text: "Câu 1. Một trong những nhiệm vụ của các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX) là",
        answers: [
          { id: 1, text: "A.  xóa bỏ phong kiến, xác lập nền dân chủ tư sản", isCorrect: true },
          { id: 2, text: "B. đưa giai cấp công nhân lên nắm chính quyền", isCorrect: false },
          { id: 3, text: "C. xóa bỏ triệt để những mâu thuẫn trong xã hội", isCorrect: false },
          { id: 4, text: "D. xác lập sự thống trị của chủ nghĩa thực dân", isCorrect: false },
        ],
      },
      {
        text: "Câu 2. Một trong những mục tiêu của các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX) là",
        answers: [
          { id: 1, text: "A. mở đường cho tư bản chủ nghĩa phát triển.", isCorrect: true },
          { id: 2, text: "B. đưa giai cấp công nhân lên nắm chính quyền", isCorrect: false },
          { id: 3, text: "C. xóa bỏ triệt để những mâu thuẫn trong xã hội", isCorrect: false },
          { id: 4, text: "D. xác lập sự thống trị của chủ nghĩa thực dân", isCorrect: false },
        ],
      },
      {
        text: "Câu 3. Dù có những nguyên nhân bùng nổ, hình thức, diễn biến và kết quả khác nhau, song các cuộc cách mạng tư sản thời cận đại đều giống nhau về",
        answers: [
          { id: 1, text: "A. mục tiêu chung (xóa bỏ những rào cản kìm hãm sự phát triển của chủ nghĩa tư bản).", isCorrect: true },
          { id: 2, text: "B. lực lượng lãnh đạo (liên minh giữa giai cấp tư sản với tầng lớp quý tộc tư sản hóa).", isCorrect: false },
          { id: 3, text: "C. nhiệm vụ cách mạng (xóa chế độ nô lệ, mở đường cho chủ nghĩa tư bản phát triển).", isCorrect: false },
          { id: 4, text: "D. động lực chính của cách mạng (giai cấp tư sản và tầng lớp quý tộc tư sản hóa).", isCorrect: false },
        ],
      },
      {
        text: "Câu 4. Cách mạng tư sản Pháp (cuối thế kỉ XVIII) đặt dưới sự lãnh đạo của",
        answers: [
          { id: 1, text: "A. A.	giai cấp tư sản và quý tộc mới", isCorrect: false },
          { id: 2, text: "B. giai cấp tư sản và chủ nô.", isCorrect: false },
          { id: 3, text: "C. giai cấp tư sản", isCorrect: true },
          { id: 4, text: "D. giai cấp vô sản", isCorrect: false },
        ],
      },
      {
        text: "Câu 5. Trong các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX, động lực quyết định thắng lợi của cách mạng là",
        answers: [
          { id: 1, text: "A. quý tộc mới", isCorrect: false },
          { id: 2, text: "B. tư sản.", isCorrect: false },
          { id: 3, text: "C. chủ nô", isCorrect: false },
          { id: 4, text: "D. quần chúng nhân dân.", isCorrect: true },
        ],
      },
      {
        text: "Câu 6. Nội dung nào sau đây là tiền đề về kinh tế dẫn đến sự bùng nổ và thắng lợi của các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX?",
        answers: [
          { id: 1, text: "A. Quan hệ sản xuất tư bản chủ nghĩa thay thế hoàn toàn quan hệ phong kiến.", isCorrect: false },
          { id: 2, text: "B. Giai cấp tư sản và đồng minh có thế lực rất lớn cả về kinh tế và chính trị.", isCorrect: false },
          { id: 3, text: "C. Những rào cản của chế độ phong kiến kìm hãm kinh tế tư bản chủ nghĩa.", isCorrect: true },
          { id: 4, text: "D. Triết học Ánh sáng ra đời, thức tĩnh, dọn đường cho quần chúng đấu tranh", isCorrect: false },
        ],
      },
      {
        text: "Câu 7. Nội dung nào sau đây là tiền đề về chính trị dẫn đến sự bùng nổ và thắng lợi của các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX?",
        answers: [
          { id: 1, text: "A. Quan hệ sản xuất tư bản chủ nghĩa thay thế hoàn toàn quan hệ phong kiến", isCorrect: false },
          { id: 2, text: "B. Giai cấp tư sản và đồng minh có thế lực rất lớn cả về kinh tế và chính trị", isCorrect: false },
          { id: 3, text: "C. Triết học Ánh sáng ra đời, thức tĩnh, dọn đường cho quần chúng đấu tranh", isCorrect: false },
          { id: 4, text: "D. Chế độ cai trị của nhà nước phong kiến, gây ra sự bất mãn trong xã hội", isCorrect: true },
        ],
      },
      {
        text: "Câu 8. Nội dung nào sau đây là tiền đề về xã hội dẫn đến sự bùng nổ và thắng lợi của các cuộc cách mạng tư sản từ giữa thế kỉ XVI đến đầu thế kỉ XX?",
        answers: [
          { id: 1, text: "A. Quan hệ sản xuất tư bản chủ nghĩa thay thế hoàn toàn quan hệ phong kiến", isCorrect: false },
          { id: 2, text: "B. Giai cấp tư sản và đồng minh có thế lực rất lớn cả về kinh tế và chính trị", isCorrect: false },
          { id: 3, text: "C. Triết học Ánh sáng ra đời, thức tĩnh, dọn đường cho quần chúng đấu tranh", isCorrect: false },
          { id: 4, text: "D. Mâu thuẫn giữa giai cấp tư sản với quý tộc phong kiến ngày càng sâu sắc", isCorrect: true },
        ],
      },
      {
        text: "Câu 9. Nội dung nào sau đây là tiền đề về tư tưởng dẫn đến sự bùng nổ và thắng lợi của cuộc cách mạng tư sản Pháp ở thế kỉ XVIII?",
        answers: [
          { id: 1, text: "A. Quan hệ sản xuất tư bản chủ nghĩa thay thế hoàn toàn quan hệ phong kiến", isCorrect: false },
          { id: 2, text: "B. Giai cấp tư sản và đồng minh có thế lực rất lớn cả về kinh tế và chính trị", isCorrect: false },
          { id: 3, text: "C. Triết học Ánh sáng ra đời, thức tỉnh, dọn đường cho quần chúng đấu tranh", isCorrect: true },
          { id: 4, text: "D. Mâu thuẫn giữa giai cấp tư sản với quý tộc phong kiến ngày càng sâu sắc", isCorrect: false },
        ],
      },
      {
        text: "Câu 10. Những đại diện tiêu biểu trong trào lưu Triết học Ánh sáng ở Pháp (thế kỉ XVIII) là",
        answers: [
          { id: 1, text: "A. C.Mác, Ph.Ăng-ghen, V.I.Lê-nin.", isCorrect: false },
          { id: 2, text: "B. S.Mông-te-xki-ơ, Ph.Vôn-te, G.Rút-xô.", isCorrect: true },
          { id: 3, text: "C. C.Phu-ri-ê, C.Xanh-xi-mông, R.Ô-oen.", isCorrect: false },
          { id: 4, text: "D. A.Xmit, C.Xanh-xi-mông, Ph.Vôn-te.", isCorrect: false },
        ],
      },
    ],
  },
];

const ELearningDoExercise = ({ route, navigation }) => {
  const { lessonsId } = route.params;
  const selectedLessons = questions.find(item => item.id === parseInt(lessonsId));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  if (!selectedLessons) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Dữ liệu không tìm thấy cho ID: {lessonsId}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.restartButton}>
          <Text style={styles.restartButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAnswerPress = (answer) => {
    setSelectedAnswer(answer);
    if (answer.isCorrect) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < selectedLessons.question.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedAnswer(null);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowScore(false);
    setSelectedAnswer(null);
    navigation.navigate('Quiz');
  };

  const Progress = () => {
    return (
      <View style={styles.progressContainer}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${((currentQuestionIndex + 1) / selectedLessons.question.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1}/{selectedLessons.question.length}
        </Text>
      </View>
    );
  };

  const FeedbackMessage = () => {
    if (!selectedAnswer) return null;
    
    return (
      <View style={[
        styles.feedbackContainer,
        selectedAnswer.isCorrect ? styles.correctFeedback : styles.wrongFeedback
      ]}>
        <Text style={styles.feedbackText}>
          {selectedAnswer.isCorrect 
            ? "Giỏi quá, bạn làm đúng rồi!" 
            : "Sai rồi, hãy ghi nhớ câu trả lời nhé!"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {showScore ? (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Bạn đã trả lời đúng {score} trên {selectedLessons.question.length} câu hỏi!</Text>
          <TouchableOpacity onPress={handleRestart} style={styles.restartButton}>
            <Text style={styles.restartButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Progress />
          <View style={styles.contentContainer}>
            <Text style={styles.questionText}>{selectedLessons.question[currentQuestionIndex].text}</Text>
            <View style={styles.answersContainer}>
              {selectedLessons.question[currentQuestionIndex].answers.map((answer) => (
                <TouchableOpacity
                  key={answer.id}
                  style={[
                    styles.answerButton,
                    selectedAnswer && selectedAnswer.id === answer.id
                      ? answer.isCorrect
                        ? styles.correctAnswer
                        : styles.wrongAnswer
                      : null
                  ]}
                  onPress={() => handleAnswerPress(answer)}
                  disabled={!!selectedAnswer}
                >
                  <Text style={[
                    styles.answerText,
                    selectedAnswer && selectedAnswer.id === answer.id && styles.selectedAnswerText
                  ]}>
                    {answer.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Feedback Message */}
            <FeedbackMessage />
            
            {/* Place for future image */}
            {/* <View style={styles.imageContainer}>
                <Image 
                  source={require('../../../assets/quiz/parrot.png')} 
                  style={styles.image} 
                  resizeMode="contain"
                />
            </View> */}
          </View>
          
          {selectedAnswer && (
            <View style={styles.bottomContainer}>
              <TouchableOpacity onPress={handleNextQuestion} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginRight: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: '500',
  },
  answersContainer: {
    marginBottom: 20,
  },
  answerButton: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  correctAnswer: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  wrongAnswer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  answerText: {
    fontSize: 16,
  },
  selectedAnswerText: {
    color: '#000',
    fontWeight: '500',
  },
  feedbackContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  correctFeedback: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  wrongFeedback: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  restartButton: {
    padding: 15,
    backgroundColor: '#007bff',
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ELearningDoExercise;