import React from 'react';
import CommonPageLayout from '../CommonPageLayout';
import { Link } from 'react-router-dom';

const WritersPage: React.FC = () => {
  const writersData = [
    {
      id: 'wrt001',
      name: '佐々木 健太(仮名)',
      bio: '映画に対する深い愛情と知識を活かし、多角的な視点から作品の魅力を紐解く映画評論家。特にインディーズ映画やドキュメンタリー作品に詳しい。',
      imageSrc: '/images/writer-sasaki.jpg',
      articles: [
        { title: '心揺さぶるヒューマンドラマの傑作', slug: '/reviews/human-drama-masterpiece' },
        { title: '知られざるインディーズ映画の才能', slug: '/reviews/indie-film-talent' },
      ],
    },
    {
      id: 'wrt002',
      name: '伊藤 美咲(仮名)',
      bio: '自身の外国語学習の経験に基づき、効果的な学習方法やモチベーション維持の秘訣を発信する語学学習アドバイザー。特に英語とフランス語に精通している。',
      imageSrc: '/images/writer-ito.jpg',
      articles: [
        { title: '挫折しない！外国語学習のステップ', slug: '/diaries/effective-language-learning' },
        { title: '多言語学習の楽しさと挑戦', slug: '/diaries/joy-of-multilingualism' },
      ],
    },
  ];

  return (
    <CommonPageLayout title="ライター紹介">
      <p className="r4k8t_paragraph">本サイト「BANMA」の記事を執筆しているライターをご紹介します。それぞれの専門分野と熱意をもって、質の高い情報をお届けしています。</p>
      <ul className="e6p2q_writers_list">
        {writersData.map((writer) => (
          <li key={writer.id} className="m9n3b_writer_item">
            <div className="g7h5j_writer_image">
              <img src={writer.imageSrc} alt={writer.name} width={100} height={100} className="c2v6x_image" />
            </div>
            <div className="d1s7f_writer_info">
              <h2 className="f3a9z_writer_name">{writer.name}</h2>
              <p className="u8b2c_writer_bio">{writer.bio}</p>
              <h3 className="i5j1k_articles_heading">執筆記事</h3>
              <ul className="o4l7m_articles_list">
                {writer.articles.map((article) => (
                  <li key={article.slug} className="p7q3r_article_item">
                    <Link to={article.slug} className="a9z5w_article_link">{article.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </CommonPageLayout>
  );
};

export default WritersPage;
