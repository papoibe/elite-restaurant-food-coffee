const faqData = [
  {
    question: "How we serve food?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  },
  {
    question: "How can we get in touch with you?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  },
  {
    question: "How is our food quality?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  },
  {
    question: "What will be delivered? And When?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  },
  {
    question: "How do we give home delivery?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  },
  {
    question: "Is this restaurant 24 hours open?",
    answer: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi quis modi ullam amet debitis libero veritatis enim repellat optio natus eum delectus deserunt, odit expedita eos molestiae ipsa totam quidem?"
  }
];

function renderFAQ() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = faqData.map((item, index) => `
    <div class="bg-[#FAF7F2] dark:bg-gray-900/50 p-6 rounded-md border border-gray-100 dark:border-gray-800 faq-item transition-all">
      <div class="flex justify-between items-center cursor-pointer faq-header" data-index="${index}">
        <h3 class="font-bold text-gray-800 dark:text-white text-base md:text-lg">${item.question}</h3>
        <button class="text-gray-700 dark:text-gray-300 faq-icon flex items-center justify-center w-6 h-6">
          <svg class="w-3.5 h-3.5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
      <div class="faq-answer mt-4 text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        <p>${item.answer}</p>
      </div>
    </div>
  `).join('');

  const headers = container.querySelectorAll('.faq-header');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      const icon = header.querySelector('.faq-icon svg');

      const isOpen = parent.classList.contains('active');

      if (isOpen) {
        parent.classList.remove('active');
        icon.classList.remove('rotate-45');
      } else {
        parent.classList.add('active');
        icon.classList.add('rotate-45'); // Dấu "+" xoay 45° trông giống dấu "×" khi mở
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', renderFAQ);
window.addEventListener('pageshow', (e) => {
  if (e.persisted) renderFAQ();
});