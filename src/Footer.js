import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Footer({ isMobile }) {
  const [openModal, setOpenModal] = useState(null); // Will be 'imprint', 'privacy', or null

  const headingStyle = {
    fontSize: "16px",
    fontWeight: "800",
    marginTop: "32px",
    marginBottom: "12px",
    textTransform: "uppercase",
  };

  const subHeadingStyle = {
    fontSize: "14px",
    fontWeight: "700",
    marginTop: "24px",
    marginBottom: "8px",
  };

  const textStyle = {
    marginBottom: "16px",
  };

  const listStyle = {
    marginBottom: "16px",
    paddingLeft: "20px",
  };

  return (
    <>
      {/* THE SMALL, FLOATING WORDS */}
      <div
        style={{
          position: "fixed",
          bottom: isMobile ? "15px" : "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          zIndex: 10000, 
          pointerEvents: "none", 
        }}
      >
        <span
          onClick={() => setOpenModal("imprint")}
          style={{
            fontSize: "10px",
            color: "#999",
            cursor: "pointer",
            pointerEvents: "auto",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#000")}
          onMouseLeave={(e) => (e.target.style.color = "#999")}
        >
          Imprint
        </span>
        <span
          onClick={() => setOpenModal("privacy")}
          style={{
            fontSize: "10px",
            color: "#999",
            cursor: "pointer",
            pointerEvents: "auto",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#000")}
          onMouseLeave={(e) => (e.target.style.color = "#999")}
        >
          Privacy Policy
        </span>
      </div>

      {/* THE FROSTED GLASS LEGAL OVERLAYS */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpenModal(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 10001, 
              backgroundColor: "rgba(242, 242, 242, 0.7)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "680px",
                maxHeight: "80vh",
                overflowY: "auto",
                padding: isMobile ? "30px 20px" : "40px",
                boxSizing: "border-box",
                textAlign: "left",
                fontSize: isMobile ? "12px" : "13px",
                lineHeight: "1.6",
                color: "#000",
                backgroundColor: "#FFF",
                borderRadius: "12px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
              }}
            >
              {openModal === "imprint" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>
                      Imprint
                    </h2>
                    <svg onClick={() => setOpenModal(null)} style={{ cursor: "pointer" }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>
                  <p style={textStyle}>
                    <strong>Information in accordance with § 5 DDG</strong>
                  </p>
                  <p style={textStyle}>
                    Lino Knödler
                    <br />
                    Kleine Freiheit 70
                    <br />
                    22767 Hamburg
                    <br />
                    Germany
                  </p>
                  <p style={textStyle}>
                    <strong>Contact</strong>
                    <br />
                    compendium.explore@gmail.com
                  </p>
                </>
              )}

              {openModal === "privacy" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: "800", textTransform: "uppercase", margin: 0 }}>
                      Privacy Policy
                    </h2>
                    <svg onClick={() => setOpenModal(null)} style={{ cursor: "pointer" }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </div>

                  <h3 style={headingStyle}>§ 1 General Information</h3>
                  <p style={textStyle}>
                    This privacy policy provides detailed information about what happens to your personal data when you visit our website www.compendium.world. All data that allows for your personal identification is personal data. When processing your data, we strictly adhere to legal requirements, in particular the General Data Protection Regulation ("GDPR"). It is very important to us that your visit to our website is completely secure.
                  </p>

                  <h3 style={headingStyle}>§ 2 Controller</h3>
                  <p style={textStyle}>
                    Responsibility for the collection and processing of personal data on this website lies, under data protection law, with:
                  </p>
                  <p style={textStyle}>
                    First name, Last name: Lino Knödler<br />
                    Street, House number, Postal code, City: Kleine Freiheit 70, 22767 Hamburg<br />
                    Country: Germany<br />
                    Email: compendium.explore@gmail.com
                  </p>

                  <h3 style={headingStyle}>§ 3 Contacting Us</h3>
                  <p style={textStyle}>
                    If you contact us, including by email, the data transmitted in the process, including your contact details, will be stored in order to process your inquiry and to be available for any follow-up questions. This data will not be passed on to third parties without your express consent.
                  </p>
                  <p style={textStyle}>
                    The processing of personal data concerning you takes place exclusively on the basis of your consent granted pursuant to Art. 6(1)(a) GDPR. You have the right to revoke this consent at any time without giving reasons. An informal notification by email to us is sufficient for revocation. The lawfulness of the data processing carried out prior to the revocation remains unaffected by the revocation.
                  </p>
                  <p style={textStyle}>
                    The transmitted data will be stored by us until you ask us to delete it, revoke your consent to storage, or the purpose for storing the data no longer applies. Mandatory statutory retention periods remain unaffected.
                  </p>

                  <h3 style={headingStyle}>§ 4 Use and Disclosure of Data</h3>
                  <p style={textStyle}>
                    We assure you that personal data you provide to us, e.g. by email (such as your name, address, or email address), will not be sold to third parties or otherwise used commercially. Your data is processed exclusively for the purpose of corresponding with you and fulfilling the purpose for which you provided us with the data. As part of payment processing, your payment data will be forwarded to the commissioned credit institution.
                  </p>
                  <p style={textStyle}>
                    Data automatically collected when you visit our website is used exclusively for the purposes stated above. The data is not used for any other purpose.
                  </p>
                  <p style={textStyle}>
                    The protection of your personal data is important to us. We therefore generally do not pass your data on to third parties unless there is a legal obligation to disclose it or you have given us your express consent.
                  </p>

                  <h3 style={headingStyle}>§ 5 Encryption (SSL/TLS)</h3>
                  <p style={textStyle}>
                    Our website uses SSL or TLS encryption to ensure the security and protection of the transmission of confidential content. This applies in particular to web requests that you, as a website visitor, send to us as the website operator. An encrypted connection can be recognized by the "https://" in your browser's address bar and the padlock symbol in your browser line.
                  </p>
                  <p style={textStyle}>
                    Activating SSL or TLS encryption means that the data you send to us cannot be read by unauthorized third parties.
                  </p>

                  <h3 style={headingStyle}>§ 6 Storage Period</h3>
                  <p style={textStyle}>
                    Your personal data transmitted to us via our website is stored only for as long as is necessary to achieve the respective purpose of the data processing. In accordance with commercial and tax law retention obligations, storage of certain data may, however, last up to 10 years.
                  </p>

                  <h3 style={headingStyle}>§ 7 Your Data Protection Rights</h3>
                  <p style={textStyle}>
                    As a data subject of the data processing, you have, in accordance with the statutory provisions, the following rights against the controller regarding your personal data:
                  </p>

                  <h4 style={subHeadingStyle}>A. Right of Withdrawal</h4>
                  <p style={textStyle}>
                    Many data processing operations are only possible with your express consent. If the processing of your data is based on your consent, you have the right to withdraw this consent at any time with effect for the future, pursuant to Art. 7(3) GDPR. The lawfulness of the data processing carried out on the basis of your consent up until the withdrawal remains unaffected. The storage of data for billing and accounting purposes is not affected by a withdrawal.
                  </p>

                  <h4 style={subHeadingStyle}>B. Right of Access</h4>
                  <p style={textStyle}>
                    Pursuant to Art. 15 GDPR, you have the right to request confirmation from us as to whether we process personal data concerning you. If this is the case, you have the right to be informed of this data, including the purposes of processing, the categories of data processed, the recipients or categories of recipients to whom the data has been or will be disclosed, the planned storage period or the criteria used to determine it, the existence of a right to rectification, erasure, restriction of processing, objection to processing, the right to lodge a complaint with a supervisory authority, the origin of the data if it was not collected from you, the existence of automated decision-making including profiling and, if applicable, meaningful information about the logic involved as well as the significance and envisaged consequences of such processing for you, as well as your right to be informed of the safeguards pursuant to Art. 46 GDPR in the event your data is transferred to third countries.
                  </p>

                  <h4 style={subHeadingStyle}>C. Right to Rectification</h4>
                  <p style={textStyle}>
                    You have the right, at any time pursuant to Art. 16 GDPR, to request the correction of inaccurate personal data concerning you and/or the completion of your incomplete data held by us.
                  </p>

                  <h4 style={subHeadingStyle}>D. Right to Erasure</h4>
                  <p style={textStyle}>
                    You have the right, pursuant to Art. 17 GDPR, to request the erasure of your personal data if one of the following grounds applies:
                  </p>
                  <ul style={listStyle}>
                    <li>a. Your personal data is no longer necessary for the purposes for which it was collected or otherwise processed.</li>
                    <li>b. You withdraw the consent on which the processing was based pursuant to Art. 6(1)(a) or Art. 9(2)(a) GDPR, and there is no other legal basis for the processing.</li>
                    <li>c. You object to the processing pursuant to Art. 21(1) GDPR and there are no overriding legitimate grounds for the processing, or you object to the processing pursuant to Art. 21(2) GDPR.</li>
                    <li>d. Your personal data has been processed unlawfully.</li>
                    <li>e. We are obliged to erase the personal data due to a legal obligation under Union law or the law of the member state to which we are subject.</li>
                    <li>f. The personal data was collected in relation to the offer of information society services referred to in Art. 8(1) GDPR.</li>
                  </ul>
                  <p style={textStyle}>This right may be restricted under the following circumstances, if the processing is necessary:</p>
                  <ul style={listStyle}>
                    <li>a. to comply with a legal obligation which requires processing under Union or member state law to which we are subject, or to perform a task carried out in the public interest or in the exercise of official authority;</li>
                    <li>b. for compliance with a legal obligation which requires processing under Union or member state law to which we are subject, or for the performance of a task carried out in the public interest or in the exercise of official authority vested in us;</li>
                    <li>c. for reasons of public interest in the area of public health pursuant to Art. 9(2)(h) and (i) as well as Art. 9(3) GDPR;</li>
                    <li>d. for archiving purposes in the public interest, scientific or historical research purposes, or statistical purposes pursuant to Art. 89(1) GDPR, insofar as the right referred to above is likely to render impossible or seriously impair the achievement of the objectives of such processing; or</li>
                    <li>e. for the establishment, exercise or defense of legal claims.</li>
                  </ul>
                  <p style={textStyle}>
                    Should we have made your personal data public and be obliged pursuant to the preceding provisions to erase it, we shall, taking account of available technology and the cost of implementation, take reasonable steps, including technical measures, to inform controllers processing the data that you, as the data subject, have requested erasure of any links to, or copies or replications of, that personal data.
                  </p>

                  <h4 style={subHeadingStyle}>E. Right to Restriction of Processing</h4>
                  <p style={textStyle}>
                    Pursuant to Art. 18 GDPR, you have the right to request the restriction (blocking) of the processing of your personal data. To exercise this right, you may contact us at any time. Contact details can be found in the imprint. Restriction of processing may be requested in the following cases:
                  </p>
                  <ul style={listStyle}>
                    <li>a. If you dispute the accuracy of the personal data stored by us, we generally need time to verify this. For the duration of this verification, you have the right to request the restriction of the processing of your personal data.</li>
                    <li>b. If the processing of your personal data was/is unlawful, you may request restriction of data processing instead of erasure.</li>
                    <li>c. If we no longer need your personal data, but you need it to establish, exercise, or defend legal claims, you have the right to request restriction of the processing of your personal data instead of erasure.</li>
                    <li>d. If you have objected to processing pursuant to Art. 21(1) GDPR, a balancing of your interests against ours must be carried out. As long as it has not yet been determined whose interests prevail, you have the right to request the restriction of the processing of your personal data.</li>
                  </ul>
                  <p style={textStyle}>
                    If the processing of your personal data has been restricted, such data may, with the exception of its storage, generally only be processed with your consent. Exceptions apply to certain legally defined cases, such as the establishment, exercise, or defense of legal claims, or the protection of public interests.
                  </p>

                  <h4 style={subHeadingStyle}>F. Right to Notification</h4>
                  <p style={textStyle}>
                    If you have exercised your right to rectification, erasure, or restriction of processing of your personal data, we are obliged, pursuant to Art. 19 GDPR, to notify all recipients to whom the data has been disclosed. This does not apply where such notification proves impossible or involves disproportionate effort. Upon your request, we will inform you of these recipients.
                  </p>

                  <h4 style={subHeadingStyle}>G. Protection Against Automated Decisions (Profiling)</h4>
                  <p style={textStyle}>
                    Pursuant to Art. 22 GDPR, you have the right not to be subject to a decision based solely on automated processing – including profiling – which produces legal effects concerning you or similarly significantly affects you.
                  </p>
                  <p style={textStyle}>This does not apply if the decision</p>
                  <ul style={listStyle}>
                    <li>a. is necessary for entering into, or the performance of, a contract between you and us,</li>
                    <li>b. is authorized by Union or member state law to which the controller is subject and which lays down suitable measures to safeguard your rights, freedoms, and legitimate interests, or</li>
                    <li>c. is based on your explicit consent.</li>
                  </ul>
                  <p style={textStyle}>
                    However, decisions in the cases referred to under (a) to (c) above may not be based on special categories of personal data within the meaning of Art. 9(1) GDPR, unless Art. 9(2)(a) or (g) applies and suitable measures have been taken to safeguard your rights and freedoms and legitimate interests.
                  </p>
                  <p style={textStyle}>
                    In the cases referred to under (a) and (c), we take reasonable steps to safeguard your rights and freedoms and your legitimate interests, including at least the right to obtain human intervention on the part of the controller, to express your own point of view, and to contest the decision.
                  </p>

                  <h4 style={subHeadingStyle}>H. Right to Data Portability</h4>
                  <p style={textStyle}>
                    Where the processing of your personal data is based on your consent pursuant to Art. 6(1)(a) GDPR or Art. 9(2)(a) GDPR, or on a contract pursuant to Art. 6(1)(b) GDPR, and is carried out by automated means, you have the right, pursuant to Art. 20 GDPR, to receive the data you have provided to us in a structured, commonly used, and machine-readable format and to transmit that data to another controller, or to request that we transmit it directly to another controller, where technically feasible.
                  </p>

                  <h4 style={subHeadingStyle}>I. Right to Object</h4>
                  <p style={textStyle}>
                    Where we process your personal data on the basis of a balancing of interests pursuant to Art. 6(1)(f) GDPR, you have the right to object at any time, for reasons arising from your particular situation, to this processing; this also applies to profiling based on such processing. The applicable legal basis for the processing can be found in this privacy policy. If you object, we will no longer process the personal data concerned unless we can demonstrate compelling legitimate grounds for the processing which override your interests, rights, and freedoms, or the processing serves the establishment, exercise, or defense of legal claims (objection pursuant to Art. 21(1) GDPR).
                  </p>
                  <p style={textStyle}>
                    Where your personal data is processed for the purposes of direct marketing, you have the right to object at any time to such processing; this also applies to profiling to the extent that it is related to such direct marketing. If you object, your personal data will no longer be used for direct marketing purposes (objection pursuant to Art. 21(2) GDPR).
                  </p>
                  <p style={textStyle}>
                    With regard to the use of information society services, and notwithstanding Directive 2002/58/EC, you have the option of exercising your right to object by automated means using technical specifications.
                  </p>

                  <h4 style={subHeadingStyle}>J. Right to Lodge a Complaint with a Supervisory Authority</h4>
                  <p style={textStyle}>
                    In the event of violations of the provisions of the GDPR, data subjects have the right to lodge a complaint with a competent supervisory authority. The complaint may be lodged, in particular, in the member state of the data subject's habitual residence, place of work, or place of the alleged infringement. The right to lodge a complaint under this provision is without prejudice to any other administrative or judicial remedy.
                  </p>
                  <p style={textStyle}>
                    Our competent supervisory authority is:<br /><br />
                    The Hamburg Commissioner for Data Protection and Freedom of Information<br />
                    Ludwig-Erhard-Str. 22 7.OG<br />
                    20459 Hamburg<br />
                    Phone: 040/428 54-40 40<br />
                    Email: mailbox@datenschutz.hamburg.de<br />
                    Website: <a href="https://www.datenschutz-hamburg.de" target="_blank" rel="noreferrer" style={{ color: "#0014FF", textDecoration: "none" }}>https://www.datenschutz-hamburg.de</a>
                  </p>

                  <h3 style={headingStyle}>§ 8 Validity and Amendment of this Privacy Policy</h3>
                  <p style={textStyle}>
                    This privacy policy takes effect on 09/01/2026. We reserve the right to amend this policy as needed, in compliance with applicable data protection laws. This may be necessary, for example, to meet new legal requirements or to reflect changes to our website or new services offered via our website. The version of the privacy policy in effect at the time of your visit to our website is binding.
                  </p>
                  <p style={textStyle}>
                    In the event of changes to this privacy policy, we will publish them on this page in order to fully inform you about which personal data we collect, how we process it, and under what conditions we may disclose it, if applicable.
                  </p>
                  
                  <h3 style={headingStyle}>§ 9 Embedded Third-Party Content & Live Previews</h3>
                  <p style={textStyle}>
                    To protect your privacy and ensure a secure browsing experience, live previews of external websites (via iFrames) and dynamically generated website screenshots (via the third-party service Microlink.io) are disabled by default on our platform.
                  </p>
                  <p style={textStyle}>
                    Only when you actively click the "Load Live Previews" button do you give your explicit consent (pursuant to Art. 6(1)(a) GDPR) for your browser to establish a direct connection to these external servers. Once activated, your IP address and technical browser data will be transmitted to the respective third-party website operator, or to the screenshot provider (Microlink HQ, Spain), just as if you had visited their website directly.
                  </p>
                  <p style={textStyle}>
                    These third-party websites may use their own cookies or tracking technologies, over which we have no influence. The respective third-party operator is solely responsible for the processing of this data. Your consent applies to your current browsing session.
                  </p>


                  <h3 style={headingStyle}>§ 10 Hosting</h3>
                  <p style={textStyle}>
                  We host our website on Vercel. The provider is Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA.
                  </p>
                  <p style={textStyle}>
                  When you visit our website, Vercel automatically collects and stores information in so-called server log files, which your browser automatically transmits to them. These are: browser type and version, operating system used, referrer URL, hostname of the accessing computer, time of the server request, and IP address.
                  </p>
                  <p style={textStyle}>
                  The use of Vercel is based on our legitimate interest in providing a reliable, fast, and secure presentation of our website pursuant to Art. 6(1)(f) GDPR. Data transfer to the US is based on the Standard Contractual Clauses (SCC) of the European Commission.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
