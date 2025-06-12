import React from 'react';
import CommonPageLayout from '../CommonPageLayout';

const TermsOfServicePage: React.FC = () => {
  return (
    <CommonPageLayout title="利用規約">
      <p className="x8c3v_paragraph">本ウェブサイト「BANMA」（以下「本サイト」といいます）をご利用いただくにあたっては、以下の利用規約（以下「本規約」といいます）をよくお読みいただき、内容を理解し、同意いただく必要があります。</p>

      <h2 className="u9a2b_subheading">第1条（総則）</h2>
      <p className="x8c3v_paragraph">1. 本規約は、本サイトの提供およびその利用に関する一切の事項に適用されます。本サイトの利用者は、本規約に同意したものとみなされます。</p>
      <p className="x8c3v_paragraph">2. 本規約に定めのない事項については、適用される法令、規則、ガイドライン、または一般的な商慣習に従うものとします。</p>

      <h2 className="u9a2b_subheading">第2条（禁止事項）</h2>
      <p className="x8c3v_paragraph">本サイトの利用者は、本サイトの利用にあたり、以下の行為を行ってはならないものとします。</p>
      <ul className="z7e4f_list">
        <li className="q1w5e_listitem">法令または公序良俗に違反する行為、またはそのおそれのある行為。</li>
        <li className="q1w5e_listitem">他者の権利（著作権、商標権、肖像権、プライバシー権、名誉権等）を侵害する行為、またはそのおそれのある行為。</li>
        <li className="q1w5e_listitem">本サイトの運営を妨害する行為、またはそのおそれのある行為。</li>
        <li className="q1w5e_listitem">虚偽の情報を登録、提供する行為。</li>
        <li className="q1w5e_listitem">有害なプログラムやスクリプト等を送信または書き込む行為。</li>
        <li className="q1w5e_listitem">その他、本サイトが不適切と判断する行為。</li>
      </ul>

      <h2 className="u9a2b_subheading">第3条（免責事項）</h2>
      <p className="x8c3v_paragraph">1. 本サイトは、提供する情報について、その正確性、完全性、最新性、有用性等に関し、いかなる保証も行うものではありません。</p>
      <p className="x8c3v_paragraph">2. 本サイトの利用に起因して利用者に生じた損害について、本サイトは一切の責任を負わないものとします。ただし、本サイトの故意または重過失による場合はこの限りではありません。</p>
      <p className="x8c3v_paragraph">3. 本サイトからリンクされている第三者のウェブサイトの内容や、その利用によって生じた損害についても、本サイトは一切の責任を負いません。</p>

      <h2 className="u9a2b_subheading">第4条（著作権）</h2>
      <p className="x8c3v_paragraph">本サイトに掲載されている文章、画像、動画、プログラム等に関する著作権は、本サイトまたは正当な権利を有する第三者に帰属します。これらのコンテンツを無断で複製、転載、改変、頒布等を行うことは禁止します。</p>

      <h2 className="u9a2b_subheading">第5条（規約の変更）</h2>
      <p className="x8c3v_paragraph">本サイトは、必要に応じて本規約の内容を随時変更することができるものとします。変更後の本規約は、本サイト上に掲載した時点から効力を生じるものとします。利用者は、変更後の本規約についても同意したものとみなされます。</p>

      <p className="x8c3v_paragraph">最終更新日：2025年5月1日</p>
    </CommonPageLayout>
  );
};

export default TermsOfServicePage;