import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

const BOOK_WIDTH = 600;
const BOOK_HEIGHT = 800;

const TOC = [
  { title: "تعريف بالشركة", page: 2 },
  { title: "رؤيتنا ورسالتنا", page: 3 },
  { title: "الخدمات التي نقدمها", page: 4 },
  { title: "دليل إنشاء فاتورة إلكترونية", page: 5 },
  { title: "معلومات التواصل", page: 6 },
];

const SERVICES = [
  { icon: "☁️", title: "منصة فوترة إلكترونية سحابية", text: "لإنشاء وإصدار وحفظ الفواتير بشكل آمن." },
  { icon: "🔗", title: "التكامل مع هيئة الزكاة", text: 'من خلال الربط المباشر مع منصة "فاتورة".' },
  { icon: "🧾", title: 'توليد "QR Code" و"UUID"', text: "تلقائيًا حسب متطلبات الهيئة." },
  { icon: "📊", title: "لوحة تحكم متعددة المستخدمين", text: "لإدارة الفواتير والعملاء والتقارير." },
  { icon: "🧩", title: "تكامل مرن مع الأنظمة المحاسبية", text: 'باستخدام "API".' },
  { icon: "🛟", title: "دعم فني", text: "قبل وأثناء وبعد التفعيل." },
];

const STEPS = [
  "تسجيل الدخول إلى لوحة التحكم باستخدام البريد وكلمة المرور.",
  'من القائمة الرئيسية، اضغط على "إنشاء فاتورة جديدة".',
  "أدخل بيانات العميل مثل الاسم، الرقم الضريبي، المدينة، إلخ.",
  "أضف المنتجات أو الخدمات مع الكمية، السعر، والضريبة لكل بند.",
  'النظام سيحسب الإجمالي والضريبة تلقائيًا ويولّد "QR" و"UUID".',
  'راجع تفاصيل الفاتورة واضغط على "إرسال" لتقديمها.',
  'يمكنك تحميل الفاتورة بصيغة "PDF" أو إرسالها بالبريد للعميل.',
];

const TOTAL_PAGES = 8;

/** Supports deep links such as /?page=5 (1-based page number). */
function getInitialPage() {
  const requested = Number(new URLSearchParams(window.location.search).get("page"));
  if (!Number.isInteger(requested) || requested < 1 || requested > TOTAL_PAGES) return 0;
  return requested - 1;
}

/** Fits the fixed-size book into small screens by scaling it down. */
function useBookScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const byWidth = (window.innerWidth - 32) / BOOK_WIDTH;
      const byHeight = (window.innerHeight - 230) / BOOK_HEIGHT;
      setScale(Math.max(0.3, Math.min(1, byWidth, byHeight)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return scale;
}

function PageChrome({ section, number, children }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <span className="brand-mini">
          <i className="brand-dot" /> eInvoiceMe
        </span>
        <span className="section-label">{section}</span>
      </div>
      <div className="page-inner">{children}</div>
      <div className="page-footer">
        <span className="footer-line" />
        <span className="footer-number">{number}</span>
        <span className="footer-line" />
      </div>
    </div>
  );
}

function Title({ children }) {
  return (
    <>
      <h2>{children}</h2>
      <div className="title-bar" />
    </>
  );
}

function App() {
  const flipBookRef = useRef(null);
  const scaleRef = useRef(null);
  const scale = useBookScale();
  const [initialPage] = useState(getInitialPage);
  const [current, setCurrent] = useState(initialPage);

  const flipNext = useCallback(() => flipBookRef.current?.pageFlip().flipNext(), []);
  const flipPrev = useCallback(() => flipBookRef.current?.pageFlip().flipPrev(), []);
  const goTo = (index) => flipBookRef.current?.pageFlip().flip(index);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") flipNext();
      if (e.key === "ArrowLeft" || e.key === "PageUp") flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipNext, flipPrev]);

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const currentPageIndex = flipBookRef.current.pageFlip().getCurrentPageIndex();
    const allPages = document.querySelectorAll(".page");
    const scaler = scaleRef.current;
    const previousTransform = scaler ? scaler.style.transform : "";
    if (scaler) scaler.style.transform = "none"; // capture at full size

    allPages.forEach((page, index) => {
      if (index !== currentPageIndex) {
        page.style.opacity = "0";
        page.style.pointerEvents = "none";
        page.style.position = "absolute";
        page.style.zIndex = "0";
      } else {
        page.style.opacity = "1";
        page.style.pointerEvents = "auto";
        page.style.position = "relative";
        page.style.zIndex = "10";
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const page = allPages[currentPageIndex];
    if (!page) {
      console.warn("الصفحة الحالية غير موجودة.");
      return;
    }

    try {
      const canvas = await html2canvas(page, {
        useCORS: true,
        scale: 1.5,
        logging: false,
        allowTaint: false,
        width: 595,
        height: 842,
        windowWidth: 595,
        windowHeight: 842,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.save("Current_Page.pdf");
    } catch (err) {
      console.warn(`فشل تصدير الصفحة: ${err.message}`);
    } finally {
      allPages.forEach((p) => {
        p.style.opacity = "";
        p.style.pointerEvents = "";
        p.style.position = "";
        p.style.zIndex = "";
      });
      if (scaler) scaler.style.transform = previousTransform;
    }
  };

  const progress = (current / (TOTAL_PAGES - 1)) * 100;

  return (
    <div className="App">
      <div className="aurora" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="stars" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} className="star" />
        ))}
      </div>

      <header className="app-header">
        <span className="app-eyebrow">COMPANY PROFILE</span>
        <h1>eInvoiceMe</h1>
      </header>

      <div
        className="book-stage"
        style={{ width: BOOK_WIDTH * scale, height: BOOK_HEIGHT * scale }}
      >
        <button className="arrow left-arrow" onClick={flipPrev} aria-label="السابق">
          ‹
        </button>

        <div
          ref={scaleRef}
          className="book-scale"
          style={{ transform: `scale(${scale})` }}
        >
          <div className="book-container">
            <HTMLFlipBook
              ref={flipBookRef}
              width={BOOK_WIDTH}
              height={BOOK_HEIGHT}
              showCover={true}
              startPage={initialPage}
              flippingTime={900}
              size="fixed"
              minWidth={BOOK_WIDTH}
              maxWidth={BOOK_WIDTH}
              minHeight={BOOK_HEIGHT}
              maxHeight={BOOK_HEIGHT}
              autoSize={false}
              useMouseEvents={true}
              swipeDistance={30}
              disableFlipByClick={false}
              clickEventForward={false}
              maxShadowOpacity={0.45}
              onFlip={(e) => setCurrent(e.data)}
              className="demo-book"
              style={{ overflow: "visible" }}
            >
              {/* 1 · الغلاف */}
              <div className="page cover-page">
                <div className="cover-shell">
                <div className="cover-rings" aria-hidden="true" />
                <div className="cover-content">
                  <div className="cover-logo">
                    <img src="/logo.png" alt="شعار eInvoiceMe" />
                  </div>
                  <p className="cover-welcome">تمكين عملك بحلول الفوترة الرقمية الذكية</p>
                  <span className="cover-chip">ZATCA · FATOORA</span>
                </div>
                </div>
              </div>

              {/* 2 · جدول المحتويات */}
              <div className="page page-formal">
                <PageChrome section="الفهرس" number="2">
                  <Title>جدول المحتويات</Title>
                  <ul className="toc">
                    {TOC.map((item) => (
                      <li key={item.page}>
                        <button type="button" className="toc-row" onClick={() => goTo(item.page)}>
                          <span className="toc-num">{item.page + 1}</span>
                          <span className="toc-title">{item.title}</span>
                          <span className="toc-dots" />
                          <span className="page-number">صفحة {item.page + 1}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="toc-hint">اضغط على أي عنوان للانتقال مباشرة إلى صفحته ✦</p>
                </PageChrome>
              </div>

              {/* 3 · تعريف بالشركة */}
              <div className="page page-formal">
                <PageChrome section="من نحن" number="3">
                  <Title>تعريف بالشركة</Title>
                  <p className="lead">
                    شركة eInvoiceMe هي شركة تقنية سعودية متخصصة في تقديم حلول الفوترة
                    الإلكترونية السحابية، تساعد الشركات على الالتزام بمتطلبات هيئة الزكاة
                    والضريبة والجمارك (ZATCA). نحن نوفر نظامًا موثوقًا وآمنًا لإنشاء وحفظ
                    وإرسال الفواتير إلكترونيًا، مما يضمن التوافق مع الأنظمة واللوائح المحلية
                    ويوفر تجربة استخدام سلسة وسريعة.
                  </p>
                  <div className="pill-row">
                    <div className="pill-card">
                      <b>ZATCA</b>
                      <span>متوافق مع الهيئة</span>
                    </div>
                    <div className="pill-card">
                      <b>Cloud</b>
                      <span>حلول سحابية</span>
                    </div>
                    <div className="pill-card">
                      <b>Secure</b>
                      <span>موثوق وآمن</span>
                    </div>
                  </div>
                  <div className="banner-card ltr">
                    <span className="banner-mark">✦</span>
                    <p>Powering businesses thrive under vision 2030</p>
                  </div>
                </PageChrome>
              </div>

              {/* 4 · رؤيتنا ورسالتنا */}
              <div className="page page-formal">
                <PageChrome section="التوجه" number="4">
                  <Title>رؤيتنا ورسالتنا</Title>
                  <div className="vm-card">
                    <div className="vm-icon">🔭</div>
                    <div>
                      <h3>رؤيتنا</h3>
                      <p>
                        أن نكون من الرواد في مجال حلول الفوترة الرقمية داخل المملكة العربية
                        السعودية، من خلال تقديم تقنيات حديثة تدعم التحول الرقمي الوطني.
                      </p>
                    </div>
                  </div>
                  <div className="vm-card alt">
                    <div className="vm-icon">🎯</div>
                    <div>
                      <h3>رسالتنا</h3>
                      <p>
                        نهدف إلى تبسيط عملية الفوترة الإلكترونية للشركات، عبر تقديم أدوات
                        ذكية، متوافقة، وآمنة، تساعد على الامتثال الكامل لأنظمة هيئة الزكاة،
                        وتحقق الكفاءة التشغيلية العالية.
                      </p>
                    </div>
                  </div>
                </PageChrome>
              </div>

              {/* 5 · الخدمات */}
              <div className="page page-formal">
                <PageChrome section="خدماتنا" number="5">
                  <Title>الخدمات التي نقدمها</Title>
                  <div className="svc-grid">
                    {SERVICES.map((s) => (
                      <div key={s.title} className="svc-card">
                        <span className="svc-icon">{s.icon}</span>
                        <h4>{s.title}</h4>
                        <p>{s.text}</p>
                      </div>
                    ))}
                  </div>
                </PageChrome>
              </div>

              {/* 6 · دليل إنشاء فاتورة */}
              <div className="page page-formal">
                <PageChrome section="الدليل" number="6">
                  <Title>دليل إنشاء فاتورة إلكترونية</Title>
                  <p className="sub">اتبع الخطوات التالية لإنشاء فاتورة إلكترونية:</p>
                  <ol className="steps">
                    {STEPS.map((text, i) => (
                      <li key={i}>
                        <span className="step-num">{i + 1}</span>
                        <span className="step-text">{text}</span>
                      </li>
                    ))}
                  </ol>
                </PageChrome>
              </div>

              {/* 7 · معلومات التواصل */}
              <div className="page page-formal">
                <PageChrome section="تواصل معنا" number="7">
                  <Title>معلومات التواصل</Title>
                  <div className="contact-grid">
                    <div className="contact-card">
                      <span className="contact-icon">📍</span>
                      <h4>فرع جدة</h4>
                      <p>
                        مكتب فايبس – الدور الرابع<br />
                        مركز U Shape – شارع الأمير سعود الفيصل<br />
                        حي الروضة، جدة 23431، السعودية
                      </p>
                    </div>
                    <div className="contact-card">
                      <span className="contact-icon">📍</span>
                      <h4>فرع مكة</h4>
                      <p>
                        شارع إبراهيم بن النبي – الدور الثاني<br />
                        حي التخصصي، مكة 24331، السعودية
                      </p>
                    </div>
                    <div className="contact-card wide">
                      <span className="contact-icon">✉️</span>
                      <h4>البريد الإلكتروني</h4>
                      <a className="ltr" href="mailto:sales@einvoiceme.com">sales@einvoiceme.com</a>
                    </div>
                    <div className="contact-card wide">
                      <span className="contact-icon">📞</span>
                      <h4>رقم الهاتف</h4>
                      <p className="ltr">+966 50 365 9839</p>
                    </div>
                  </div>
                </PageChrome>
              </div>

              {/* 8 · صفحة ختامية */}
              <div className="page cover-page">
                <div className="cover-shell">
                <div className="cover-rings" aria-hidden="true" />
                <div className="cover-content">
                  <div className="thanks-mark">✦</div>
                  <h3 className="thanks-title">شكرًا لكم</h3>
                  <p className="thanks-text">
                    نتطلع لبناء شراكة دائمة معكم، وتعزيز نجاح أعمالكم من خلال حلولنا الذكية
                    للفوترة الإلكترونية.
                  </p>
                  <span className="cover-chip ltr">sales@einvoiceme.com</span>
                </div>
                </div>
              </div>
            </HTMLFlipBook>
          </div>
        </div>

        <button className="arrow right-arrow" onClick={flipNext} aria-label="التالي">
          ›
        </button>
      </div>

      <div className="toolbar">
        <button className="tool-btn" onClick={flipPrev}>
          السابق
        </button>
        <div className="progress-wrap" role="status" aria-live="polite">
          <span className="progress-text">
            {current + 1} / {TOTAL_PAGES}
          </span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <button className="tool-btn" onClick={flipNext}>
          التالي
        </button>
        <button className="tool-btn pdf" onClick={exportToPDF} aria-label="PDF">
          PDF
        </button>
      </div>
      <p className="hint">اسحب الصفحة أو استخدم الأسهم ← → للتنقل</p>
    </div>
  );
}

export default App;
