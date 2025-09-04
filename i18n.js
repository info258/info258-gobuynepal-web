<!-- i18n.js -->
<script>
/**
 * Minimal client-side i18n for GoBuy Nepal
 * - Stores language in localStorage: gbn_lang, gbn_lang_auto
 * - Auto sets document dir for RTL (Arabic)
 * - Translate elements with:
 *    data-i18n="key" (textContent)
 *    data-i18n-placeholder="key" (placeholder attr)
 *    data-i18n-title="key" (title attr)
 *    data-i18n-aria="key" (aria-label attr)
 */
(function () {
  const KEY_LANG = 'gbn_lang';
  const KEY_LANG_AUTO = 'gbn_lang_auto';

  const dict = {
    en: {
      welcome: 'Welcome to GoBuy Nepal!',
      feat_shop: '✅ Shop From Top Shopping Sites all over the world',
      feat_fast: '✅ Fast and Reliable Delivery',
      feat_secure: '✅ Secure Online Payments',
      btn_request: 'REQUEST ORDER',
      btn_chat: 'QUICK CHAT',
      action_confirm: 'CONFIRM\nORDER',
      action_track: 'TRACK\nORDER',
      action_help: 'HELP',
      nav_home: 'Home',
      nav_explore: 'Explore',
      nav_cart: 'Cart',
      nav_alerts: 'Alerts',
      nav_profile: 'Profile'
    },
    ne: {
      welcome: 'गोबाय नेपालमा स्वागत छ!',
      feat_shop: '✅ विश्वका शीर्ष वेबसाइटबाट किनमेल',
      feat_fast: '✅ छिटो र भरपर्दो डेलिभरी',
      feat_secure: '✅ सुरक्षित अनलाइन भुक्तानी',
      btn_request: 'अर्डर अनुरोध',
      btn_chat: 'छिटो च्याट',
      action_confirm: 'अर्डर\nपुष्टि',
      action_track: 'अर्डर\nट्र्याक',
      action_help: 'सहायता',
      nav_home: 'गृहपृष्ठ',
      nav_explore: 'एक्स्प्लोर',
      nav_cart: 'कार्ट',
      nav_alerts: 'सूचना',
      nav_profile: 'प्रोफाइल'
    },
    hi: {
      welcome: 'गोबाय नेपाल में आपका स्वागत है!',
      feat_shop: '✅ दुनिया की टॉप साइट्स से शॉपिंग',
      feat_fast: '✅ तेज़ और भरोसेमंद डिलीवरी',
      feat_secure: '✅ सुरक्षित ऑनलाइन भुगतान',
      btn_request: 'ऑर्डर अनुरोध',
      btn_chat: 'त्वरित चैट',
      action_confirm: 'ऑर्डर\nपुष्टि',
      action_track: 'ऑर्डर\nट्रैक',
      action_help: 'सहायता',
      nav_home: 'होम',
      nav_explore: 'एक्सप्लोर',
      nav_cart: 'कार्ट',
      nav_alerts: 'अलर्ट',
      nav_profile: 'प्रोफ़ाइल'
    },
    zh: {
      welcome: '欢迎来到 GoBuy Nepal！',
      feat_shop: '✅ 覆盖全球主流电商平台',
      feat_fast: '✅ 快速且可靠的配送',
      feat_secure: '✅ 安全的在线支付',
      btn_request: '请求下单',
      btn_chat: '快速聊天',
      action_confirm: '确认\n订单',
      action_track: '订单\n跟踪',
      action_help: '帮助',
      nav_home: '首页',
      nav_explore: '发现',
      nav_cart: '购物车',
      nav_alerts: '提醒',
      nav_profile: '个人资料'
    },
    ar: {
      welcome: 'مرحبًا بك في GoBuy Nepal!',
      feat_shop: '✅ تسوّق من أشهر المواقع حول العالم',
      feat_fast: '✅ توصيل سريع وموثوق',
      feat_secure: '✅ مدفوعات إلكترونية آمنة',
      btn_request: 'طلب طلبية',
      btn_chat: 'دردشة سريعة',
      action_confirm: 'تأكيد\nالطلب',
      action_track: 'تتبع\nالطلب',
      action_help: 'مساعدة',
      nav_home: 'الرئيسية',
      nav_explore: 'استكشاف',
      nav_cart: 'السلة',
      nav_alerts: 'التنبيهات',
      nav_profile: 'الملف الشخصي'
    }
  };

  function bestDeviceLang() {
    const p = ((navigator.languages && navigator.languages[0]) || navigator.language || 'en').toLowerCase();
    if (p.startsWith('ne')) return 'ne';
    if (p.startsWith('hi')) return 'hi';
    if (p.startsWith('zh')) return 'zh';
    if (p.startsWith('ar')) return 'ar';
    return 'en';
  }

  function currentLang() {
    const auto = localStorage.getItem(KEY_LANG_AUTO) === 'on';
    return auto ? bestDeviceLang() : (localStorage.getItem(KEY_LANG) || 'en');
  }

  function setDir(code) {
    document.documentElement.dir = (code === 'ar') ? 'rtl' : 'ltr';
  }

  function t(key, code) {
    const lang = code || currentLang();
    const table = dict[lang] || dict.en;
    return table[key] || dict.en[key] || key;
  }

  function apply(root) {
    const scope = root || document;
    const lang = currentLang();
    setDir(lang);

    // textContent targets
    scope.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const text = t(key, lang);
      // support \n for line breaks
      if (text.includes('\n')) {
        el.innerHTML = '';
        text.split('\n').forEach((line, i) => {
          if (i) el.appendChild(document.createElement('br'));
          el.appendChild(document.createTextNode(line));
        });
      } else {
        el.textContent = text;
      }
    });

    // attribute targets
    scope.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder'), lang));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title'), lang));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), lang));
    });
  }

  // Auto-apply when DOM ready
  document.addEventListener('DOMContentLoaded', () => apply());

  // expose small API
  window.i18n = { t, apply, dict, currentLang, setDir };
})();
</script>
