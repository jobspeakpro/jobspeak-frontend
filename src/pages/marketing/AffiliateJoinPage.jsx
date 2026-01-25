import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/apiClient.js';
import UniversalHeader from '../../components/UniversalHeader.jsx';

export default function AffiliateJoinPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [platform, setPlatform] = useState("");
    const [payoutMethod, setPayoutMethod] = useState("");

    useEffect(() => {
        document.title = "Affiliate Application | JobSpeakPro";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target;

        // Basic validation
        if (!platform || !payoutMethod) {
            alert("Please complete all required fields.");
            setLoading(false);
            return;
        }

        const payload = {
            name: form['full-name'].value,
            email: form['email'].value,
            country: form['country'].value,
            platform: platform === 'other' ? form['platform_other'].value : platform,
            audienceSize: form['audience'].value,
            channelLink: form['link'].value,
            promoPlan: form['strategy'].value,
            payoutMethod: payoutMethod,
            payoutDetails: {}
        };

        if (payoutMethod === 'paypal') {
            payload.payoutDetails.email = form['paypal_email'].value;
        } else if (payoutMethod === 'stripe') {
            payload.payoutDetails.email = form['stripe_email'].value;
        } else if (payoutMethod === 'crypto') {
            payload.payoutDetails.wallet = form['crypto_wallet'].value;
            payload.payoutDetails.network = form['crypto_network'].value;
        }

        try {
            await apiClient.post("/affiliate/apply", payload);
            navigate('/affiliate/joined');
        } catch (err) {
            console.error("Affiliate apply error:", err);
            setLoading(false);
            alert(err.response?.data?.error || "Something went wrong. Please check your inputs and try again.");
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            <UniversalHeader />

            <main className="flex-grow flex flex-col items-center justify-center px-6 py-12">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-[#dce0e5] dark:border-gray-800 overflow-hidden">
                    <div className="px-8 pt-8 pb-6 border-b border-[#f0f2f4] dark:border-gray-800">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">Affiliate Application</h1>
                                <p className="text-[#637588] dark:text-gray-400 mt-1">Tell us about your audience and platform.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-semibold text-[#197fe6]">Step 1 of 2</span>
                                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
                                    <div className="w-1/2 h-full bg-[#197fe6]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-6">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="full-name">Full Name</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="full-name" placeholder="John Doe" type="text" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="email">Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="email" placeholder="john@example.com" type="email" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="country">Country</label>
                                    <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="country">
                                        <option value="">Select Country</option>
                                        <option value="AF">Afghanistan</option>
                                        <option value="AX">Åland Islands</option>
                                        <option value="AL">Albania</option>
                                        <option value="DZ">Algeria</option>
                                        <option value="AS">American Samoa</option>
                                        <option value="AD">Andorra</option>
                                        <option value="AO">Angola</option>
                                        <option value="AI">Anguilla</option>
                                        <option value="AQ">Antarctica</option>
                                        <option value="AG">Antigua and Barbuda</option>
                                        <option value="AR">Argentina</option>
                                        <option value="AM">Armenia</option>
                                        <option value="AW">Aruba</option>
                                        <option value="AU">Australia</option>
                                        <option value="AT">Austria</option>
                                        <option value="AZ">Azerbaijan</option>
                                        <option value="BS">Bahamas</option>
                                        <option value="BH">Bahrain</option>
                                        <option value="BD">Bangladesh</option>
                                        <option value="BB">Barbados</option>
                                        <option value="BY">Belarus</option>
                                        <option value="BE">Belgium</option>
                                        <option value="BZ">Belize</option>
                                        <option value="BJ">Benin</option>
                                        <option value="BM">Bermuda</option>
                                        <option value="BT">Bhutan</option>
                                        <option value="BO">Bolivia</option>
                                        <option value="BQ">Bonaire, Sint Eustatius and Saba</option>
                                        <option value="BA">Bosnia and Herzegovina</option>
                                        <option value="BW">Botswana</option>
                                        <option value="BV">Bouvet Island</option>
                                        <option value="BR">Brazil</option>
                                        <option value="IO">British Indian Ocean Territory</option>
                                        <option value="BN">Brunei Darussalam</option>
                                        <option value="BG">Bulgaria</option>
                                        <option value="BF">Burkina Faso</option>
                                        <option value="BI">Burundi</option>
                                        <option value="KH">Cambodia</option>
                                        <option value="CM">Cameroon</option>
                                        <option value="CA">Canada</option>
                                        <option value="CV">Cape Verde</option>
                                        <option value="KY">Cayman Islands</option>
                                        <option value="CF">Central African Republic</option>
                                        <option value="TD">Chad</option>
                                        <option value="CL">Chile</option>
                                        <option value="CN">China</option>
                                        <option value="CX">Christmas Island</option>
                                        <option value="CC">Cocos (Keeling) Islands</option>
                                        <option value="CO">Colombia</option>
                                        <option value="KM">Comoros</option>
                                        <option value="CG">Congo</option>
                                        <option value="CD">Congo, Democratic Republic of the</option>
                                        <option value="CK">Cook Islands</option>
                                        <option value="CR">Costa Rica</option>
                                        <option value="CI">Côte d'Ivoire</option>
                                        <option value="HR">Croatia</option>
                                        <option value="CU">Cuba</option>
                                        <option value="CW">Curaçao</option>
                                        <option value="CY">Cyprus</option>
                                        <option value="CZ">Czech Republic</option>
                                        <option value="DK">Denmark</option>
                                        <option value="DJ">Djibouti</option>
                                        <option value="DM">Dominica</option>
                                        <option value="DO">Dominican Republic</option>
                                        <option value="EC">Ecuador</option>
                                        <option value="EG">Egypt</option>
                                        <option value="SV">El Salvador</option>
                                        <option value="GQ">Equatorial Guinea</option>
                                        <option value="ER">Eritrea</option>
                                        <option value="EE">Estonia</option>
                                        <option value="ET">Ethiopia</option>
                                        <option value="FK">Falkland Islands (Malvinas)</option>
                                        <option value="FO">Faroe Islands</option>
                                        <option value="FJ">Fiji</option>
                                        <option value="FI">Finland</option>
                                        <option value="FR">France</option>
                                        <option value="GF">French Guiana</option>
                                        <option value="PF">French Polynesia</option>
                                        <option value="TF">French Southern Territories</option>
                                        <option value="GA">Gabon</option>
                                        <option value="GM">Gambia</option>
                                        <option value="GE">Georgia</option>
                                        <option value="DE">Germany</option>
                                        <option value="GH">Ghana</option>
                                        <option value="GI">Gibraltar</option>
                                        <option value="GR">Greece</option>
                                        <option value="GL">Greenland</option>
                                        <option value="GD">Grenada</option>
                                        <option value="GP">Guadeloupe</option>
                                        <option value="GU">Guam</option>
                                        <option value="GT">Guatemala</option>
                                        <option value="GG">Guernsey</option>
                                        <option value="GN">Guinea</option>
                                        <option value="GW">Guinea-Bissau</option>
                                        <option value="GY">Guyana</option>
                                        <option value="HT">Haiti</option>
                                        <option value="HM">Heard Island and McDonald Islands</option>
                                        <option value="VA">Holy See (Vatican City State)</option>
                                        <option value="HN">Honduras</option>
                                        <option value="HK">Hong Kong</option>
                                        <option value="HU">Hungary</option>
                                        <option value="IS">Iceland</option>
                                        <option value="IN">India</option>
                                        <option value="ID">Indonesia</option>
                                        <option value="IR">Iran, Islamic Republic of</option>
                                        <option value="IQ">Iraq</option>
                                        <option value="IE">Ireland</option>
                                        <option value="IM">Isle of Man</option>
                                        <option value="IL">Israel</option>
                                        <option value="IT">Italy</option>
                                        <option value="JM">Jamaica</option>
                                        <option value="JP">Japan</option>
                                        <option value="JE">Jersey</option>
                                        <option value="JO">Jordan</option>
                                        <option value="KZ">Kazakhstan</option>
                                        <option value="KE">Kenya</option>
                                        <option value="KI">Kiribati</option>
                                        <option value="KP">Korea, Democratic People's Republic of</option>
                                        <option value="KR">Korea, Republic of</option>
                                        <option value="KW">Kuwait</option>
                                        <option value="KG">Kyrgyzstan</option>
                                        <option value="LA">Lao People's Democratic Republic</option>
                                        <option value="LV">Latvia</option>
                                        <option value="LB">Lebanon</option>
                                        <option value="LS">Lesotho</option>
                                        <option value="LR">Liberia</option>
                                        <option value="LY">Libya</option>
                                        <option value="LI">Liechtenstein</option>
                                        <option value="LT">Lithuania</option>
                                        <option value="LU">Luxembourg</option>
                                        <option value="MO">Macao</option>
                                        <option value="MK">Macedonia, the former Yugoslav Republic of</option>
                                        <option value="MG">Madagascar</option>
                                        <option value="MW">Malawi</option>
                                        <option value="MY">Malaysia</option>
                                        <option value="MV">Maldives</option>
                                        <option value="ML">Mali</option>
                                        <option value="MT">Malta</option>
                                        <option value="MH">Marshall Islands</option>
                                        <option value="MQ">Martinique</option>
                                        <option value="MR">Mauritania</option>
                                        <option value="MU">Mauritius</option>
                                        <option value="YT">Mayotte</option>
                                        <option value="MX">Mexico</option>
                                        <option value="FM">Micronesia, Federated States of</option>
                                        <option value="MD">Moldova, Republic of</option>
                                        <option value="MC">Monaco</option>
                                        <option value="MN">Mongolia</option>
                                        <option value="ME">Montenegro</option>
                                        <option value="MS">Montserrat</option>
                                        <option value="MA">Morocco</option>
                                        <option value="MZ">Mozambique</option>
                                        <option value="MM">Myanmar</option>
                                        <option value="NA">Namibia</option>
                                        <option value="NR">Nauru</option>
                                        <option value="NP">Nepal</option>
                                        <option value="NL">Netherlands</option>
                                        <option value="NC">New Caledonia</option>
                                        <option value="NZ">New Zealand</option>
                                        <option value="NI">Nicaragua</option>
                                        <option value="NE">Niger</option>
                                        <option value="NG">Nigeria</option>
                                        <option value="NU">Niue</option>
                                        <option value="NF">Norfolk Island</option>
                                        <option value="MP">Northern Mariana Islands</option>
                                        <option value="NO">Norway</option>
                                        <option value="OM">Oman</option>
                                        <option value="PK">Pakistan</option>
                                        <option value="PW">Palau</option>
                                        <option value="PS">Palestinian Territory, Occupied</option>
                                        <option value="PA">Panama</option>
                                        <option value="PG">Papua New Guinea</option>
                                        <option value="PY">Paraguay</option>
                                        <option value="PE">Peru</option>
                                        <option value="PH">Philippines</option>
                                        <option value="PN">Pitcairn</option>
                                        <option value="PL">Poland</option>
                                        <option value="PT">Portugal</option>
                                        <option value="PR">Puerto Rico</option>
                                        <option value="QA">Qatar</option>
                                        <option value="RE">Réunion</option>
                                        <option value="RO">Romania</option>
                                        <option value="RU">Russian Federation</option>
                                        <option value="RW">Rwanda</option>
                                        <option value="BL">Saint Barthélemy</option>
                                        <option value="SH">Saint Helena, Ascension and Tristan da Cunha</option>
                                        <option value="KN">Saint Kitts and Nevis</option>
                                        <option value="LC">Saint Lucia</option>
                                        <option value="MF">Saint Martin (French part)</option>
                                        <option value="PM">Saint Pierre and Miquelon</option>
                                        <option value="VC">Saint Vincent and the Grenadines</option>
                                        <option value="WS">Samoa</option>
                                        <option value="SM">San Marino</option>
                                        <option value="ST">Sao Tome and Principe</option>
                                        <option value="SA">Saudi Arabia</option>
                                        <option value="SN">Senegal</option>
                                        <option value="RS">Serbia</option>
                                        <option value="SC">Seychelles</option>
                                        <option value="SL">Sierra Leone</option>
                                        <option value="SG">Singapore</option>
                                        <option value="SX">Sint Maarten (Dutch part)</option>
                                        <option value="SK">Slovakia</option>
                                        <option value="SI">Slovenia</option>
                                        <option value="SB">Solomon Islands</option>
                                        <option value="SO">Somalia</option>
                                        <option value="ZA">South Africa</option>
                                        <option value="GS">South Georgia and the South Sandwich Islands</option>
                                        <option value="SS">South Sudan</option>
                                        <option value="ES">Spain</option>
                                        <option value="LK">Sri Lanka</option>
                                        <option value="SD">Sudan</option>
                                        <option value="SR">Suriname</option>
                                        <option value="SJ">Svalbard and Jan Mayen</option>
                                        <option value="SZ">Swaziland</option>
                                        <option value="SE">Sweden</option>
                                        <option value="CH">Switzerland</option>
                                        <option value="SY">Syrian Arab Republic</option>
                                        <option value="TW">Taiwan, Province of China</option>
                                        <option value="TJ">Tajikistan</option>
                                        <option value="TZ">Tanzania, United Republic of</option>
                                        <option value="TH">Thailand</option>
                                        <option value="TL">Timor-Leste</option>
                                        <option value="TG">Togo</option>
                                        <option value="TK">Tokelau</option>
                                        <option value="TO">Tonga</option>
                                        <option value="TT">Trinidad and Tobago</option>
                                        <option value="TN">Tunisia</option>
                                        <option value="TR">Turkey</option>
                                        <option value="TM">Turkmenistan</option>
                                        <option value="TC">Turks and Caicos Islands</option>
                                        <option value="TV">Tuvalu</option>
                                        <option value="UG">Uganda</option>
                                        <option value="UA">Ukraine</option>
                                        <option value="AE">United Arab Emirates</option>
                                        <option value="GB">United Kingdom</option>
                                        <option value="US">United States</option>
                                        <option value="UY">Uruguay</option>
                                        <option value="UZ">Uzbekistan</option>
                                        <option value="VU">Vanuatu</option>
                                        <option value="VE">Venezuela, Bolivarian Republic of</option>
                                        <option value="VN">Viet Nam</option>
                                        <option value="VG">Virgin Islands, British</option>
                                        <option value="VI">Virgin Islands, U.S.</option>
                                        <option value="WF">Wallis and Futuna</option>
                                        <option value="EH">Western Sahara</option>
                                        <option value="YE">Yemen</option>
                                        <option value="ZM">Zambia</option>
                                        <option value="ZW">Zimbabwe</option>
                                    </select>
                                </div>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-6">Channel Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="platform">Primary Platform</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]"
                                        id="platform"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                    >
                                        <option value="">Select Platform</option>
                                        <option value="youtube">YouTube</option>
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="blog">Blog</option>
                                        <option value="community">Community</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                {platform === 'other' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="platform_other">Specify Platform</label>
                                        <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="platform_other" placeholder="e.g. Instagram" type="text" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="audience">Audience Size</label>
                                    <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="audience">
                                        <option value="">Select Size</option>
                                        <option value="<5k">&lt;5k</option>
                                        <option value="5k-20k">5k-20k</option>
                                        <option value="20k-50k">20k-50k</option>
                                        <option value="50k-100k">50k-100k</option>
                                        <option value="100k-200k">100k-200k</option>
                                        <option value="200k-500k">200k-500k</option>
                                        <option value="500k+">500k+</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold" htmlFor="link">Link to Channel / Portfolio</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="link" placeholder="https://youtube.com/c/yourchannel" type="url" />
                                </div>
                            </div>
                        </section>
                        <section>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold" htmlFor="strategy">How do you plan to promote JobSpeakPro?</label>
                                <textarea required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="strategy" placeholder="Tell us about your content strategy..." rows="4"></textarea>
                            </div>
                        </section>
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[#637588] mb-4">Payout Preference</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'paypal' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="paypal" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">account_balance_wallet</span>
                                    <span className="text-sm font-bold">PayPal</span>
                                </label>
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'stripe' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="stripe" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">credit_card</span>
                                    <span className="text-sm font-bold">Stripe</span>
                                </label>
                                <label className={`relative flex flex-col items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${payoutMethod === 'crypto' ? 'border-[#197fe6] bg-blue-50 dark:bg-blue-900/20' : 'border-[#dce0e5] dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                                    <input className="absolute top-3 right-3 text-[#197fe6] focus:ring-[#197fe6] h-4 w-4" name="payout" type="radio" value="crypto" onChange={(e) => setPayoutMethod(e.target.value)} />
                                    <span className="material-symbols-outlined text-[#197fe6] text-3xl">currency_bitcoin</span>
                                    <span className="text-sm font-bold">Crypto (USDT)</span>
                                </label>
                            </div>

                            {/* Conditional Payout Fields */}
                            {payoutMethod === 'paypal' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold" htmlFor="paypal_email">PayPal Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="paypal_email" type="email" placeholder="paypal@example.com" />
                                </div>
                            )}
                            {payoutMethod === 'stripe' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-sm font-semibold" htmlFor="stripe_email">Stripe Email Address</label>
                                    <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="stripe_email" type="email" placeholder="stripe@example.com" />
                                </div>
                            )}
                            {payoutMethod === 'crypto' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="crypto_wallet">USDT Wallet Address</label>
                                        <input required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="crypto_wallet" type="text" placeholder="0x..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold" htmlFor="crypto_network">Network</label>
                                        <select required className="w-full px-4 py-2.5 rounded-lg border border-[#dce0e5] dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-[#197fe6] focus:border-[#197fe6]" id="crypto_network">
                                            <option value="">Select Network</option>
                                            <option value="ERC20">Ethereum (ERC20)</option>
                                            <option value="TRC20">Tron (TRC20)</option>
                                            <option value="BSC">Binance Smart Chain (BEP20)</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </section>
                        <div className="pt-6 border-t border-[#f0f2f4] dark:border-gray-800 space-y-6">
                            <button
                                className="w-full bg-[#197fe6] text-white font-bold py-4 rounded-xl hover:bg-[#197fe6]/90 shadow-lg shadow-[#197fe6]/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Application"}
                            </button>
                            <div className="flex items-start gap-3 bg-blue-50/50 dark:bg-[#197fe6]/5 p-4 rounded-xl">
                                <span className="material-symbols-outlined text-[#197fe6] text-xl">info</span>
                                <p className="text-xs text-[#637588] dark:text-gray-400 leading-relaxed">
                                    We manually review every application within 48 hours to ensure a high-quality partnership. You will receive an email once your application has been processed.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <footer className="bg-white dark:bg-[#111921] border-t border-[#dce0e5] dark:border-gray-800 py-8">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3 opacity-60 grayscale">
                        <span className="font-bold">JobSpeakPro</span>
                    </div>
                    <div className="flex gap-8 text-xs font-medium text-[#637588] dark:text-gray-400">
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Affiliate Terms</a>
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Privacy Policy</a>
                        <a className="hover:text-[#197fe6] transition-colors" href="#">Support</a>
                    </div>
                    <div className="text-xs text-[#637588] dark:text-gray-400">
                        © 2024 JobSpeakPro Inc.
                    </div>
                </div>
            </footer>
        </div>
    );
}
