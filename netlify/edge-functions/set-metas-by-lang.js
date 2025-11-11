export default async (request, context) => {
 
    // Get lang
    const headerLang = (request.headers.get('accept-language') || 'en').split(',').shift().trim().split(';').shift();
    const urlLang = request.url.split('/').pop();
    const lang = 'pt en es fr de'.includes(urlLang) ? urlLang : headerLang.split('-').shift().toLowerCase();


    // If language isn't matched, return in english
    let title = 'Cost projection of a restaurant, cafe or bar';
    let desc = 'App to help entrepreneurs with restaurant, café, or bar projects estimate operating costs based on simple variables';

    switch (lang) {
        case 'pt':
            title = 'Projeção de custo de um restaurante, café ou bar';
            desc = 'App para ajudar empresários com projeto de Restaurante, café ou bar a estimar custos de operação com base em variáveis simples';
            break;

        case 'es':
            title = 'Proyección de costos de un restaurante, cafetería o bar';
            desc = 'Aplicación para ayudar a los emprendedores con proyectos de restaurantes, cafeterías o bares a estimar los costos operativos en función de variables simples.';
            break;    
            
        case 'fr':
            title = 'Élaboration d\'une estimation des coûts pour un restaurant, un café ou un bar';
            desc = 'Application destinée à aider les entrepreneurs ayant des projets de restaurant, de café ou de bar à estimer les coûts d\'exploitation à partir de variables simples.';
            break;
            
        case 'de':
            title = 'Kostenprognose für ein Restaurant, Café oder eine Bar';
            desc = 'App zur Unterstützung von Unternehmern bei Restaurant-, Café- oder Barprojekten, um die Betriebskosten anhand einfacher Variablen zu schätzen.';
            break;

        default:
            // English
    }

    const response = await context.next();
    let html = await response.text();
  
    html = html.replace(/\$\$\$LANG\$\$\$/g, lang).replace(/\$\$\$TITLE\$\$\$/g, title).replace(/\$\$\$DESC\$\$\$/g, desc).replace(/\$\$\$LANGTAG\$\$\$/g, langTag);
  
    // Return the response
    return new Response(html, response);
};