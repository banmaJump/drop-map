import React from 'react';
import CommonPageLayout from '../CommonPageLayout';

const BatonPrivacyPage: React.FC = () => {
  return (
    <CommonPageLayout title="個人情報保護方針">
      <p className="y2d6s_paragraph">
        本ウェブサイト「BANMA」（以下「本サイト」といいます）は、利用者の個人情報の保護を最重要事項の一つとして認識し、法令および本プライバシーポリシーに従い、適切な取り扱いおよび保護に努めます。
      </p>

      <h2 className="v5b8n_subheading">1. 収集する個人情報</h2>
      <p className="y2d6s_paragraph">本サイトでは、主として以下の情報を収集する場合があります。</p>
      <ul className="w9f1g_list">
        <li className="t3h7j_listitem">お問い合わせフォームを通じてご提供いただく、氏名、メールアドレス、お問い合わせ内容。</li>
        <li className="t3h7j_listitem">本サイトの利用状況に関する情報（アクセスログ、Cookie、IPアドレス、ブラウザの種類、利用日時等）。</li>
      </ul>

      <h2 className="v5b8n_subheading">2. 個人情報の利用目的</h2>
      <p className="y2d6s_paragraph">収集した個人情報は、主に以下の目的で利用いたします。</p>
      <ul className="w9f1g_list">
        <li className="t3h7j_listitem">利用者からのお問い合わせへの対応、および関連する情報提供。</li>
        <li className="t3h7j_listitem">本サイトの改善、新しいサービスの開発、および運営に関する分析。</li>
        <li className="t3h7j_listitem">利用規約や本プライバシーポリシーの変更、その他重要なお知らせの通知。</li>
        <li className="t3h7j_listitem">不正行為の防止および対応。</li>
      </ul>

      <h2 className="v5b8n_subheading">3. 個人情報の管理</h2>
      <p className="y2d6s_paragraph">
        収集した個人情報は、漏洩、滅失、毀損等を防止するために、適切なセキュリティ対策を講じ、厳重に管理いたします。また、利用目的を達成した個人情報は、速やかに適切な方法で廃棄いたします。
      </p>

      <h2 className="v5b8n_subheading">4. 個人情報の第三者への提供</h2>
      <p className="y2d6s_paragraph">本サイトは、以下の場合を除き、利用者の同意なしに個人情報を第三者に提供することはありません。</p>
      <ul className="w9f1g_list">
        <li className="t3h7j_listitem">法令に基づく場合。</li>
        <li className="t3h7j_listitem">人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき。</li>
        <li className="t3h7j_listitem">公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき。</li>
        <li className="t3h7j_listitem">
          国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき。
        </li>
      </ul>

      <h2 className="v5b8n_subheading">5. 個人情報の開示、訂正、削除</h2>
      <p className="y2d6s_paragraph">
        利用者は、本サイトが保有するご自身の個人情報について、開示、訂正、削除等を請求する権利を有します。ご希望の場合は、お問い合わせフォームよりご連絡ください。ご本人であることを確認させていただいた上で、合理的な範囲内で速やかに対応いたします。
      </p>

      <h2 className="v5b8n_subheading">6. Cookie（クッキー）の利用</h2>
      <p className="y2d6s_paragraph">
        本サイトでは、利用者の利便性向上、アクセス状況の分析、および広告配信のためにCookieを利用する場合があります。利用者は、ブラウザの設定によりCookieの受け取りを拒否することができますが、その場合、本サイトの一部機能が正常に動作しない可能性があります。
      </p>

      <h2 className="v5b8n_subheading">7. 本プライバシーポリシーの変更</h2>
      <p className="y2d6s_paragraph">
        本サイトは、法令の改正、社会情勢の変化、または本サイトの運営上の必要性等に応じて、本プライバシーポリシーを随時変更することがあります。変更後の本プライバシーポリシーは、本サイト上に掲載した時点から効力を生じるものとします。
      </p>

      <p className="y2d6s_paragraph">最終更新日：2025年5月1日</p>
    </CommonPageLayout>
  );
};

export default BatonPrivacyPage;