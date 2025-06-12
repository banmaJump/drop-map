import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faYoutube, faInstagram } from '@fortawesome/free-brands-svg-icons';
import './Footer.scss';

const Footer = () => {
    return (
        <footer>
            <ul className="sns-btn">
                <li>
                    <a href="https://twitter.com/" className="twitter" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faTwitter} />
                    </a>
                </li>
                <li>
                    <a href="https://www.youtube.com/" className="youtube" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faYoutube} />
                    </a>
                </li>
                <li>
                    <a href="https://www.instagram.com/" className="instagram" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                </li>
            </ul>


            <div className="links">
                <ul>
                    <li><Link to="/rules/terms_of_service">利用規約</Link></li>
                    <li><Link to="/rules/baton-privacy">個人情報保護方針</Link></li>
                    <li><Link to="/rules/privacy-policy">プライバシーポリシー</Link></li>
                    <li><Link to="/rules/disclaimer">免責事項</Link></li>
                    <li><Link to="/rules/writers">ライター紹介</Link></li>
                    <li><Link to="/rules/contact">お問い合わせ</Link></li>
                </ul>
            </div>


            <p>© BANMA</p>
        </footer>
    );
};

export default Footer;
