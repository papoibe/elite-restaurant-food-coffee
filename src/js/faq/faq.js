import { getLang } from '../i18n.js';

export const faqData = [
  {
    id: 1,
    question: "How we serve food?",
    question_vi: "Quy trình phục vụ món ăn như thế nào?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Món ăn tại nhà hàng được chế biến tươi nóng ngay sau khi nhận order với nguyên liệu hữu cơ đảm bảo tiêu chuẩn an toàn và phục vụ nhanh chóng tại bàn.",
    isOpen: false
  },
  {
    id: 2,
    question: "How can we get in touch with you?",
    question_vi: "Làm thế nào để liên hệ với chúng tôi?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Bạn có thể liên hệ trực tiếp qua hotline, đặt bàn trực tuyến qua website hoặc gửi tin nhắn qua các kênh mạng xã hội chính thức của nhà hàng.",
    isOpen: true
  },
  {
    id: 3,
    question: "How is our food quality?",
    question_vi: "Chất lượng thực phẩm được đảm bảo ra sao?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Toàn bộ nguyên liệu được kiểm định nghiêm ngặt mỗi ngày từ các nông trại đạt chuẩn chất lượng cao, giữ trọn hương vị tươi ngon và giàu dinh dưỡng.",
    isOpen: false
  },
  {
    id: 4,
    question: "What will be delivered? And When?",
    question_vi: "Giao hàng gồm những gì và trong bao lâu?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Chúng tôi đóng gói toàn bộ món ăn trong hộp giữ nhiệt thân thiện với môi trường và giao đến tận nơi trong vòng 30 - 45 phút.",
    isOpen: false
  },
  {
    id: 5,
    question: "How do we give home delivery?",
    question_vi: "Cách thức đặt và giao hàng tận nơi?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Bạn chỉ cần chọn món trực tiếp trên website, nhân viên sẽ xác nhận đơn và điều phối đội ngũ giao hàng nhanh chóng đến địa chỉ của bạn.",
    isOpen: false
  },
  {
    id: 6,
    question: "Is this restaurant 24 hours open?",
    question_vi: "Nhà hàng có mở cửa 24/7 không?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?",
    answer_vi: "Nhà hàng mở cửa phục vụ từ 8:00 sáng đến 22:00 tối các ngày trong tuần, riêng cuối tuần mở cửa đến 23:00.",
    isOpen: false
  }
];

export function renderFAQ() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  const lang = getLang ? getLang() : 'vi';

  container.innerHTML = faqData.map(item => {
    const question = lang === 'vi' ? (item.question_vi || item.question) : item.question;
    const answer = lang === 'vi' ? (item.answer_vi || item.answer) : item.answer;

    return `
      <div class="faq-card bg-[#FAF7F2] dark:bg-bg-dark-2 rounded-[2px] p-6 transition-all duration-200" data-id="${item.id}">
        <div class="faq-header flex justify-between items-center cursor-pointer select-none">
          <h3 class="font-bold text-[18px] text-[#333333] dark:text-white leading-tight">${question}</h3>
          <button class="faq-icon text-[#333333] dark:text-white w-6 h-6 flex items-center justify-center pointer-events-none" aria-label="Toggle">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              ${item.isOpen 
                ? '<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>' 
                : '<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>'
              }
            </svg>
          </button>
        </div>
        <div class="faq-body ${item.isOpen ? 'block' : 'hidden'} mt-6 text-[16px] leading-[24px] text-[#4F4F4F] dark:text-gray-300 font-normal">
          <p>${answer}</p>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.faq-card').forEach(card => {
    card.querySelector('.faq-header').addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      const targetItem = faqData.find(f => f.id === id);
      if (targetItem) {
        targetItem.isOpen = !targetItem.isOpen;
        renderFAQ();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', renderFAQ);

window.addEventListener('languageChanged', () => {
  renderFAQ();
});