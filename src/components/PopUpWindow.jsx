import React from "react";
import "./PopUpWindow.css";

function PopUpWindow({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h2>دليل إنشاء فاتورة إلكترونية</h2>
        <ul className="popup-content">
          <li>تسجيل الدخول إلى لوحة التحكم باستخدام البريد وكلمة المرور.</li>
          <li>الضغط على "إنشاء فاتورة جديدة" من القائمة.</li>
          <li>إدخال بيانات العميل مثل الاسم والرقم الضريبي.</li>
          <li>إضافة المنتجات أو الخدمات مع الكمية والسعر.</li>
          <li>سيتم احتساب الضريبة والإجمالي تلقائيًا.</li>
          <li>مراجعة ومعاينة الفاتورة.</li>
          <li>إرسال الفاتورة وربطها مع هيئة الزكاة.</li>
          <li>تحميل الفاتورة بصيغة PDF أو إرسالها بالبريد.</li>
        </ul>
        <button className="popup-close" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </div>
  );
}

export default PopUpWindow;
