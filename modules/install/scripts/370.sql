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
       'Consimtamant GDPR - Avel Technologies',
       'In Avel Technologies, ne dorim sa fim in contact cu cei mai talentati oameni tehnici\r\ndin industrie.\r\nPentru a putea sa te informam cu privire la rolurile disponibile atat acum, cat si pe\r\nviitor, te rugam sa ne dai acceptul tau pentru prelucrarea datelor tale cu caracter\r\npersonal. Astfel, vom putea sa te tinem la curent cu cele mai noi oportunitati de\r\ncolaborare cu noi, cele mai interesante proiecte, job-uri promovate de echipa HR,\r\ntechnical tips si evenimente organizate.\r\nReguli Aplicabile\r\nIn contextul activitatilor de recrutare si selectie de personal pe care le desfasuram, va\r\nfacem cunoscut faptul ca, de la momentul primului nostru contact, indiferent daca\r\nacesta este telefonic, prin email, Skype, WhatsApp, prin intermediul unei platforme\r\nspecializate de recrutare/HR, al transmiterii CV-ului dumneavoastra ori a unei scrisori\r\nde intentie catre compania Avel Technologies prin orice modalitate de comunicare a\r\nacestor documente, compania va prelucra informatii cu caracter personal de natura sa\r\nidentifice o anumita persoana, precum si date cu caracter personal care nu sunt\r\nsusceptibile de a duce la identificarea unei persoane.\r\nAstfel, de informatii pot consta in informatii referitoare la numele si prenumele dvs.,\r\nadresa de domiciliu si adresa de corespondenta, adresa de e-mail, numar de telefon, ID\r\nSkype, data nasterii, varsta, studii absolvite, alte calificari, competente, poza, experienta\r\nanterioara de munca, experienta de voluntariat, interese personale, referinte\r\nprofesionale, date privind detinerea permisului de conducere, alte date pe care le-ati\r\ntransmis catre noi prin CV ori scrisoare de intentie, precum si datele pe care le-ati facut\r\npublice pe platforme precum Facebook si LinkedIn.\r\nDe asemenea, datele transmise de dumneavoastra catre noi pot fi impartasite cu\r\nclienti sau potentiali clienti ai companiei noastre in situatia in care recrutarea este\r\npentru un proiect specific ce presupune colaborarea cu acestia.\r\nNu in ultimul rand, este posibil sa cerem referinte de la fosti angajatori, demers pe care\r\nuzual il desfasuram in etapele finale ale procesului de recrutare si selectie de personal.\r\nCopyright Avel Technologies - Restricted Distribution - info@aveltechnologies.com\r\nVa aducem la cunostinta ca datele astfel obtinute, in baza consimtamantului\r\ndumneavoastra, le vom stoca in conditii de siguranta pentru o perioada de maxim 3 ani,\r\nsolicitandu-va periodic reactualizarea acestora. De asemenea, puteti solicita\r\nreactualizarea datelor dvs. oricand considerati necesar. Totodata, va puteti retrage\r\noricand dorit consimtamantul cu privire la prelucrarea acestor date de catre noi, prin\r\nsimpla transmitere a unei solicitari in acest sens, prin e-mail la adresa\r\ndpo@aveltechnologies.com sau la sediul firmei, la adresa Strada Piata Unirii Nr. 4, Sibiu, jud. Sibiu.\r\nPentru mai multe detalii te rugam sa accesezi pagina noastra\r\noficiala: https://aveltechnologies.com/privacy-policy/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'ro'
);

INSERT INTO gdpr_notice (site_id, lang, title, body_text, updated_at)
SELECT s.site_id,
       'en',
       'GDPR Consent - Avel Technologies',
       'Hello,\r\nAt Avel Technologies, we want to stay connected with the most talented technical\r\nprofessionals in the industry.\r\nTo be able to inform you about the roles available now and in the future, we kindly ask\r\nfor your consent to process your personal data. This will allow us to keep you updated\r\non the latest collaboration opportunities with us, the most exciting projects, job\r\nopenings promoted by the HR team, technical tips, and organized events.\r\n\r\nApplicable Rules\r\nIn the context of our recruitment and selection activities, we inform you that from the\r\nmoment of our first contact - whether by phone, email, Skype, WhatsApp, through a\r\nspecialized recruitment/HR platform, by receiving your CV or a cover letter by any\r\nmeans - Avel Technologies will process personal data that may identify a person, as well\r\nas personal data that is not likely to lead to the identification of a person.\r\n\r\nPlease note that the data obtained with your consent will be securely stored for a\r\nmaximum period of 3 years, during which we will periodically ask you to update your\r\ninformation. You may also request updates to your data at any time you deem\r\nnecessary. Furthermore, you can withdraw your consent for the processing of this data\r\nat any time by simply sending a request via email to dpo@aveltechnologies.com or by\r\nmail to our company headquarters: Strada Piata Unirii Nr. 4, Sibiu, jud. Sibiu.\r\n\r\nFor more details, please visit our official page:\r\nhttps://aveltechnologies.com/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'en'
);

INSERT INTO gdpr_notice (site_id, lang, title, body_text, updated_at)
SELECT s.site_id,
       'fr',
       'Consentement RGPD - Avel Technologies',
       'Bonjour,\r\nChez Avel Technologies Roumanie, nous souhaitons rester en contact avec les\r\nprofessionnels techniques les plus talentueux du secteur.\r\nAfin de pouvoir vous informer sur les postes disponibles actuellement, ainsi que sur\r\nceux a venir, nous vous prions de bien vouloir nous donner votre consentement pour le\r\ntraitement de vos donnees personnelles. Cela nous permettra de vous tenir informe\r\ndes dernieres opportunites de collaboration avec nous, des projets les plus\r\ninteressants, des offres d''emploi promues par l''equipe RH, de conseils techniques, ainsi\r\nque des evenements organises.\r\nRegles applicables\r\nDans le cadre de nos activites de recrutement et de selection, nous vous informons\r\nqu''a partir du moment de notre premier contact - que ce soit par telephone, par\r\ne-mail, via Skype, WhatsApp, une plateforme specialisee en recrutement/RH, ou par\r\nl''envoi de votre CV ou lettre de motivation a Avel Technologies par tout moyen de\r\ncommunication - notre societe traitera des informations a caractere personnel\r\npermettant d''identifier une personne, ainsi que des donnees personnelles qui ne\r\npermettent pas une identification directe.\r\nCes informations peuvent inclure : votre nom et prenom, adresse de domicile et de\r\ncorrespondance, adresse e-mail, numero de telephone, identifiant Skype, date de\r\nnaissance, age, diplomes obtenus, autres qualifications, competences, photo,\r\nexperiences professionnelles anterieures, experiences de benevolat, centres d''interet,\r\nreferences professionnelles, donnees concernant le permis de conduire, ainsi que\r\ntoutes autres informations transmises via votre CV ou lettre de motivation. Nous\r\npourrons egalement utiliser les donnees que vous avez rendues publiques sur des\r\nplateformes telles que Facebook ou LinkedIn.\r\nLes donnees que vous nous transmettez peuvent egalement etre partagees avec nos\r\nclients ou clients potentiels dans le cas d''un recrutement pour un projet specifique\r\nnecessitant une collaboration avec eux.\r\nCopyright Avel Technologies - Restricted Distribution - info@aveltechnologies.com\r\nEnfin, il est possible que nous demandions des references a vos anciens employeurs,\r\ndemarche que nous effectuons generalement dans les phases finales du processus de\r\nrecrutement et de selection.\r\nNous vous informons que, avec votre consentement, les donnees collectees seront\r\nstockees en toute securite pour une duree maximale de 3 ans, avec des demandes\r\nperiodiques de mise a jour. Vous pouvez egalement demander une mise a jour de vos\r\ndonnees a tout moment. Par ailleurs, vous pouvez a tout moment retirer votre\r\nconsentement au traitement de vos donnees en nous envoyant simplement une\r\ndemande a l''adresse suivante : dpo@aveltechnologies.com ou a notre siege social, a\r\nl''adresse suivante : Strada Piata Unirii Nr. 4, Sibiu, jud. Sibiu.\r\nPour plus d''informations, veuillez consulter notre page officielle :\r\nhttps://aveltechnologies.com/privacy-policy/',
       NOW()
FROM site s
WHERE NOT EXISTS (
    SELECT 1 FROM gdpr_notice n
    WHERE n.site_id = s.site_id AND n.lang = 'fr'
);
