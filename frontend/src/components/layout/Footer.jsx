import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/5 bg-[#060a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Logo size="md" darkText={true} className="mb-4" />
            <p className="text-sm text-gray-500 max-w-sm">
              {t('footer_brand_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer_product')}</h4>
            <div className="space-y-2.5">
              {[t('footer_link_dashboard'), t('footer_link_assessment'), t('footer_link_meal_plans'), t('footer_link_food_diary')].map((item) => (
                <a key={item} href="#" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">{t('footer_support')}</h4>
            <div className="space-y-2.5">
              {[t('footer_link_docs'), t('footer_link_api'), t('footer_link_contact'), t('footer_link_privacy')].map((item) => (
                <a key={item} href="#" className="block text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} NutriAI — Asheesh Patel. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Github, Twitter, Mail].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-600 hover:text-gray-400 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
