import React, { useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const flipBookRef = useRef(null);

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const currentPageIndex = flipBookRef.current
      .pageFlip()
      .getCurrentPageIndex();

    const allPages = document.querySelectorAll(".page");
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
      allPages.forEach((page) => {
        page.style.opacity = "";
        page.style.pointerEvents = "";
        page.style.position = "";
        page.style.zIndex = "";
      });
    }
  };

  return (
    <div className="App">
      <div className="book-wrapper" style={{ overflow: "hidden" }}>
        <button
          className="arrow left-arrow"
          onClick={() => flipBookRef.current.pageFlip().flipPrev()}
          aria-label="السابق"
        >
          ←
        </button>

        <div className="book-container" style={{ overflow: "hidden" }}>
          <HTMLFlipBook
            ref={flipBookRef}
            width={600}
            height={800}
            showCover={true}
            startPage={0}
            flippingTime={800}
            size="fixed"
            minWidth={600}
            maxWidth={600}
            minHeight={800}
            maxHeight={800}
            autoSize={false}
            useMouseEvents={true}
            swipeDistance={30}
            disableFlipByClick={false}
            clickEventForward={false}
            className="demo-book"
            style={{ overflow: "visible" }}
          >
            {/* الغلاف */}
            <div className="page cover-page">
              <div className="top-center">
                <img
                  src="/logo.png"
                  alt="شعار eInvoiceMe"
                  style={{ width: "200px", marginBottom: "40px" }}
                />
                <p className="cover-welcome">
                  تمكين عملك بحلول الفوترة الرقمية الذكية
                </p>
              </div>
            </div>

            {/* جدول المحتويات */}
            <div className="page page-formal">
              <div
                className="top-center"
                style={{ overflowY: "auto", maxHeight: "100%" }}
              >
                <h2>جدول المحتويات</h2>
                <ul
                  className="toc"
                  style={{ direction: "rtl", textAlign: "center" }}
                >
                  <li>
                    <span className="page-number">صفحة 3</span> .......... تعريف
                    بالشركة
                  </li>
                  <li>
                    <span className="page-number">صفحة 4</span> ..........
                    رؤيتنا ورسالتنا
                  </li>
                  <li>
                    <span className="page-number">صفحة 5</span> ..........
                    الخدمات التي نقدمها
                  </li>
                  <li>
                    <span className="page-number">صفحة 6</span> .......... دليل
                    إنشاء فاتورة إلكترونية
                  </li>
                  <li>
                    <span className="page-number">صفحة 7</span> ..........
                    معلومات التواصل
                  </li>
                </ul>
              </div>
            </div>

            {/* تعريف بالشركة */}
            <div
              className="page page-formal content-page numbered-page"
              data-page-number="3"
            >
              <div className="top-center">
                <h2>تعريف بالشركة</h2>
                <p>
                  شركة eInvoiceMe هي شركة تقنية سعودية متخصصة في تقديم حلول
                  الفوترة الإلكترونية السحابية، تساعد الشركات على الالتزام
                  بمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA). نحن نوفر
                  نظامًا موثوقًا وآمنًا لإنشاء وحفظ وإرسال الفواتير إلكترونيًا،
                  مما يضمن التوافق مع الأنظمة واللوائح المحلية ويوفر تجربة
                  استخدام سلسة وسريعة.
                </p>
              </div>
            </div>

            {/* رؤيتنا ورسالتنا */}
            <div
              className="page page-formal content-page numbered-page"
              data-page-number="4"
            >
              <div className="top-center">
                <h2>رؤيتنا ورسالتنا</h2>
                <p>
                  <strong>رؤيتنا:</strong> أن نكون من الرواد في مجال حلول
                  الفوترة الرقمية داخل المملكة العربية السعودية، من خلال تقديم
                  تقنيات حديثة تدعم التحول الرقمي الوطني.
                </p>
                <p>
                  <strong>رسالتنا:</strong> نهدف إلى تبسيط عملية الفوترة
                  الإلكترونية للشركات، عبر تقديم أدوات ذكية، متوافقة، وآمنة،
                  تساعد على الامتثال الكامل لأنظمة هيئة الزكاة، وتحقق الكفاءة
                  التشغيلية العالية.
                </p>
              </div>
            </div>

            {/* الخدمات التي نقدمها */}
            <div
              className="page page-formal content-page numbered-page"
              data-page-number="5"
            >
              <div className="top-center">
                <h2>الخدمات التي نقدمها</h2>
                <ul style={{ direction: "rtl", textAlign: "center" }}>
                  <li>
                    منصة فوترة إلكترونية سحابية: لإنشاء وإصدار وحفظ الفواتير
                    بشكل آمن.
                  </li>
                  <li>
                    التكامل مع هيئة الزكاة: من خلال الربط المباشر مع منصة
                    "فاتورة".
                  </li>
                  <li>توليد "QR Code" و"UUID": تلقائيًا حسب متطلبات الهيئة.</li>
                  <li>
                    لوحة تحكم متعددة المستخدمين: لإدارة الفواتير والعملاء
                    والتقارير.
                  </li>
                  <li>تكامل مرن مع الأنظمة المحاسبية: باستخدام "API".</li>
                  <li>دعم فني: قبل وأثناء وبعد التفعيل.</li>
                </ul>
              </div>
            </div>

            {/* دليل إنشاء فاتورة إلكترونية */}
            <div
              className="page page-formal content-page numbered-page"
              data-page-number="6"
            >
              <div className="top-center">
                <h2>دليل إنشاء فاتورة إلكترونية</h2>
                <p>اتبع الخطوات التالية لإنشاء فاتورة إلكترونية:</p>
                <ul style={{ direction: "rtl", textAlign: "center" }}>
                  <li>
                    تسجيل الدخول إلى لوحة التحكم باستخدام البريد وكلمة المرور.
                  </li>
                  <li>من القائمة الرئيسية، اضغط على "إنشاء فاتورة جديدة".</li>
                  <li>
                    أدخل بيانات العميل مثل الاسم، الرقم الضريبي، المدينة، إلخ.
                  </li>
                  <li>
                    أضف المنتجات أو الخدمات مع الكمية، السعر، والضريبة لكل بند.
                  </li>
                  <li>
                    النظام سيحسب الإجمالي والضريبة تلقائيًا ويولّد "QR" و"UUID".
                  </li>
                  <li>راجع تفاصيل الفاتورة واضغط على "إرسال" لتقديمها.</li>
                  <li>
                    يمكنك تحميل الفاتورة بصيغة "PDF" أو إرسالها بالبريد للعميل.
                  </li>
                </ul>
              </div>
            </div>

            {/* معلومات التواصل */}
           <div
  className="page page-formal content-page numbered-page"
  data-page-number="7"
>
  <div
    className="top-center"
    style={{ textAlign: "right", direction: "rtl", paddingRight: "40px", lineHeight: "1.8" }}
  >
    <h2 style={{ textAlign: "center" }}>معلومات التواصل</h2>

    <p>
      <strong>فرع جدة</strong><br />
      مكتب فايبس – الدور الرابع<br />
      مركز U Shape – شارع الأمير سعود الفيصل<br />
      حي الروضة، جدة 23431، السعودية
    </p>

    <p>
      <strong>فرع مكة</strong><br />
      شارع إبراهيم بن النبي – الدور الثاني<br />
      حي التخصصي، مكة 24331، السعودية
    </p>

    <p>
      <strong>البريد الإلكتروني</strong><br />
      <a
        href="mailto:sales@einvoiceme.com"
        style={{
          color: "#007bff",
          textDecoration: "underline",
          direction: "ltr",
          display: "inline-block",
        }}
      >
        sales@einvoiceme.com
      </a>
    </p>

    <p>
      <strong>رقم الهاتف</strong><br />
      +966 50 365 9839
    </p>
  </div>
</div>


            {/* صفحة ختامية */}
            <div className="page cover-page">
              <div className="top-center">
                <h3>شكرًا لكم</h3>
                <p>
                  نتطلع لبناء شراكة دائمة معكم، وتعزيز نجاح أعمالكم من خلال
                  حلولنا الذكية للفوترة الإلكترونية.
                </p>
              </div>
            </div>
          </HTMLFlipBook>
        </div>

        <button
          className="arrow right-arrow"
          onClick={() => flipBookRef.current.pageFlip().flipNext()}
          aria-label="التالي"
        >
          →
        </button>
      </div>

      <div className="navigation-buttons">
        <button
          className="nav-button back-button"
          onClick={() => flipBookRef.current.pageFlip().flipPrev()}
        >
          السابق
        </button>
        <button
          className="nav-button forward-button"
          onClick={() => flipBookRef.current.pageFlip().flipNext()}
        >
          التالي
        </button>
      </div>

      <button className="download-button" onClick={exportToPDF}>
        PDF
      </button>
    </div>
  );
}

export default App;
