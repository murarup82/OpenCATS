CREATE TABLE IF NOT EXISTS gdpr_notice (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    site_id INT NOT NULL,
    lang ENUM('ro','en','fr') NOT NULL,
    title VARCHAR(255) NOT NULL,
    body_text MEDIUMTEXT NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uniq_site_lang (site_id, lang)
);

INSERT INTO gdpr_notice (site_id, lang, title, body_text, updated_at)
SELECT s.site_id,
       'ro',
       'Consim?amânt GDPR – Avel Technologies',
       'În Avel Technologies, ne dorim sa fim în contact cu cei mai talenta?i oameni tehnici\r\ndin industrie.\r\nPentru a putea sa te informam cu privire la rolurile disponibile atât acum, cât?i pe\r\nviitor, te rugam sa ne dai acceptul tau pentru prelucrarea datelor tale cu caracter\r\npersonal. Astfel, vom putea sa te ?inem la curent cu cele mai noi oportunita?i de\r\ncolaborare cu noi, cele mai interesante proiecte, job-uri promovate de echipa HR,\r\ntechnical tips ?i evenimente organizate.\r\nReguli Aplicabile\r\nÎn contextul activita?ilor de recrutare ?i selec?ie de personal pe care le desfa?uram, va\r\nfacem cunoscut faptul ca, de la momentul primului nostru contact, indiferent daca\r\nacesta este telefonic, prin email, Skype, WhatsApp, prin intermediul unei platforme\r\nspecializate de recrutare/HR, al transmiterii CV-ului dumneavoastra ori a unei scrisori\r\nde inten?ie catre compania Avel Technologies prin orice modalitate de comunicare a\r\nacestor documente, compania va prelucra informa?ii cu caracter personal de natura sa\r\nidentifice o anumita persoana, precum ?i date cu caracter personal care nu sunt\r\nsusceptibile de a duce la identificarea unei persoane.\r\nAstfel, de informa?ii pot consta în informa?ii referitoare la numele ?i prenumele dvs.,\r\nadresa de domiciliu ?i adresa de coresponden?a, adresa de e-mail, numar de telefon, ID\r\nSkype, data na?terii, vârsta, studii absolvite, alte calificari, competen?e, poza, experien?a\r\nanterioara de munca, experien?a de voluntariat, interese personale, referin?e\r\nprofesionale, date privind de?inerea permisului de conducere, alte date pe care le-a?i\r\ntransmis catre noi prin CV ori scrisoare de inten?ie, precum ?i datele pe care le-a?i facut\r\npublice pe platforme precum Facebook ?i LinkedIn.\r\nDe asemenea, datele transmise de dumneavoastra catre noi pot fi împarta?ite cu\r\nclien?i sau poten?iali clien?i ai companiei noastre în situa?ia în care recrutarea este\r\npentru un proiect specific ce presupune colaborarea cu ace?tia.\r\nNu în ultimul rând, este posibil sa cerem referin?e de la fo?ti angajatori, demers pe care\r\nuzual îl desfa?uram în etapele finale ale procesului de recrutare ?i selec?ie de personal.\r\nCopyright Avel Technologies - Restricted Distribution - info@aveltechnologies.com\r\nVa aducem la cuno?tin?a ca datele astfel ob?inute, în baza consim?amântului\r\ndumneavoastra, le vom stoca în condi?ii de siguran?a pentru o perioada de maxim 3 ani,\r\nsolicitându-va periodic reactualizarea acestora. De asemenea, pute?i solicita\r\nreactualizarea datelor dvs. oricând considera?i necesar. Totodata, va pute?i retrage\r\noricând dorit consim?amântul cu privire la prelucrarea acestor date de catre noi, prin\r\nsimpla transmitere a unei solicitari în acest sens, prin e-mail la adresa\r\ndpo@aveltechonologies.com sau la sediul firmei, la adresa str. Octavian Goga nr. 5, bl.\r\n8, ap. 803, loc. Selimbar, jud. Sibiu.\r\nPentru mai multe detalii te rugam sa accesezi pagina noastra\r\noficiala: https://aveltechnologies.com/privacy-policy/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'ro'
);

INSERT INTO gdpr_notice (site_id, lang, title, body_text, updated_at)
SELECT s.site_id,
       'en',
       'GDPR Consent – Avel Technologies',
       'Hello,\r\nAt Avel Technologies, we want to stay connected with the most talented technical\r\nprofessionals in the industry.\r\nTo be able to inform you about the roles available now and in the future, we kindly ask\r\nfor your consent to process your personal data. This will allow us to keep you updated\r\non the latest collaboration opportunities with us, the most exciting projects, job\r\nopenings promoted by the HR team, technical tips, and organized events.\r\n\r\nApplicable Rules\r\nIn the context of our recruitment and selection activities, we inform you that from the\r\nmoment of our first contact—whether by phone, email, Skype, WhatsApp, through a\r\nspecialized recruitment/HR platform, by receiving your CV or a cover letter by any\r\nmeans—Avel Technologies will process personal data that may identify a person, as well\r\nas personal data that is not likely to lead to the identification of a person.\r\n\r\nPlease note that the data obtained with your consent will be securely stored for a\r\nmaximum period of 3 years, during which we will periodically ask you to update your\r\ninformation. You may also request updates to your data at any time you deem\r\nnecessary. Furthermore, you can withdraw your consent for the processing of this data\r\nat any time by simply sending a request via email to dpo@aveltechnologies.com or by\r\nmail to our company headquarters: str. Octavian Goga nr. 5, bl. 8, ap. 803, Selimbar,\r\nSibiu County.\r\n\r\nFor more details, please visit our official page:\r\nhttps://aveltechnologies.com/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'en'
);

INSERT INTO gdpr_notice (site_id, lang, title, body_text, updated_at)
SELECT s.site_id,
       'fr',
       'Consentement RGPD – Avel Technologies',
       'Bonjour,\r\nChez Avel Technologies Roumanie, nous souhaitons rester en contact avec les\r\nprofessionnels techniques les plus talentueux du secteur.\r\nAfin de pouvoir vous informer sur les postes disponibles actuellement, ainsi que sur\r\nceux à venir, nous vous prions de bien vouloir nous donner votre consentement pour le\r\ntraitement de vos données personnelles. Cela nous permettra de vous tenir informé\r\ndes dernières opportunités de collaboration avec nous, des projets les plus\r\nintéressants, des offres d''emploi promues par l''équipe RH, de conseils techniques, ainsi\r\nque des événements organisés.\r\nRègles applicables\r\nDans le cadre de nos activités de recrutement et de sélection, nous vous informons\r\nqu''à partir du moment de notre premier contact — que ce soit par téléphone, par\r\ne-mail, via Skype, WhatsApp, une plateforme spécialisée en recrutement/RH, ou par\r\nl’envoi de votre CV ou lettre de motivation à Avel Technologies par tout moyen de\r\ncommunication — notre société traitera des informations à caractère personnel\r\npermettant d’identifier une personne, ainsi que des données personnelles qui ne\r\npermettent pas une identification directe.\r\nCes informations peuvent inclure : votre nom et prénom, adresse de domicile et de\r\ncorrespondance, adresse e-mail, numéro de téléphone, identifiant Skype, date de\r\nnaissance, âge, diplômes obtenus, autres qualifications, compétences, photo,\r\nexpériences professionnelles antérieures, expériences de bénévolat, centres d’intérêt,\r\nréférences professionnelles, données concernant le permis de conduire, ainsi que\r\ntoutes autres informations transmises via votre CV ou lettre de motivation. Nous\r\npourrons également utiliser les données que vous avez rendues publiques sur des\r\nplateformes telles que Facebook ou LinkedIn.\r\nLes données que vous nous transmettez peuvent également être partagées avec nos\r\nclients ou clients potentiels dans le cas d’un recrutement pour un projet spécifique\r\nnécessitant une collaboration avec eux.\r\nCopyright Avel Technologies - Restricted Distribution - info@aveltechnologies.com\r\nEnfin, il est possible que nous demandions des références à vos anciens employeurs,\r\ndémarche que nous effectuons généralement dans les phases finales du processus de\r\nrecrutement et de sélection.\r\nNous vous informons que, avec votre consentement, les données collectées seront\r\nstockées en toute sécurité pour une durée maximale de 3 ans, avec des demandes\r\npériodiques de mise à jour. Vous pouvez également demander une mise à jour de vos\r\ndonnées à tout moment. Par ailleurs, vous pouvez à tout moment retirer votre\r\nconsentement au traitement de vos données en nous envoyant simplement une\r\ndemande à l’adresse suivante : dpo@aveltechnologies.com ou à notre siège social, à\r\nl’adresse suivante : str. Octavian Goga nr. 5, bl. 8, ap. 803, Selimbar, département de\r\nSibiu.\r\nPour plus d''informations, veuillez consulter notre page officielle :\r\nhttps://aveltechnologies.com/privacy-policy/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'fr'
);
