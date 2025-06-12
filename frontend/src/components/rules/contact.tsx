import React from 'react';
import CommonPageLayout from '../CommonPageLayout';

const ContactPage: React.FC = () => {
  return (
    <CommonPageLayout title="お問い合わせ">
      <p className="s6d1f_paragraph">
        本サイト「BANMA」に関するお問い合わせは、以下のフォームよりお願いいたします。QuizKnockの専用フォームに移動します。
      </p>
      <div className="v9a7z_contact_link">
        <a
          href="https://portal.quizknock.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          className="b2x5c_link_button"
        >
          お問い合わせフォームへ
        </a>
      </div>
    </CommonPageLayout>
  );
};

export default ContactPage;
