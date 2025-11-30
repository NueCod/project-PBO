// FAQSection.tsx
import { SectionProps, ToggleFaqProps } from '../interfaces';
import { DataService } from '../dataService';

const FAQSection = ({ darkMode, openFaqIndex, toggleFaq }: SectionProps & ToggleFaqProps) => {
  const faqs = DataService.getFAQs();

  return (
    <section id="faqs" className={`py-20 px-5 ${darkMode ? 'bg-gray-800' : ''}`}>
      <div className="max-w-[800px] mx-auto px-[20px] sm:px-[40px]">
        <div className="text-center mb-16">
          <h2 className={`text-[2rem] sm:text-[2.5rem] md:text-[3rem] font-bold mb-4 ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Pertanyaan Umum</h2>
          <p className={`text-base sm:text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`}>
            Segala yang perlu Anda ketahui tentang InternSheep.
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-[#e5e7eb]'}`}>
              <button
                className={`w-full p-4 sm:p-6 text-left flex justify-between items-center ${darkMode ? 'text-white' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <span className={`text-base sm:text-lg md:text-xl font-medium ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>{faq.question}</span>
                <div className={`transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                  <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-[#737373]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {openFaqIndex === index && (
                <div className={`px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t text-sm sm:text-base ${darkMode ? 'border-gray-700 text-gray-300' : 'border-[#e5e7eb] text-[#737373]'}`}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;