/* end to end testit
käytin AI:ta antamaan mulle esimerkki testejä jota muokkasin sopivaksi, yritin käyttää
tekoälyä muokkaamaan testit yhtenäiseksi, mutta meni liian monimutkaiseksi (komentti alempana),
joten palautin muutokset pois aijempaan versioon. Käytin myös teköälyn parannus ja korjaus
ehdotuksia apuna koodaamisen aikana. 
väleissä on monta wait komentoja jotta näkisi parempi ehkä mitä testeissä tapahtuu. */

describe('To-Do App End-to-End Tests', () => {
    beforeEach(() => {
        cy.clearLocalStorage(); // clear anything in the cache
        cy.visit('/'); // mene sovellukseen
    });

    // luo tehtävä
    it('should create a new task', () => {
        // uuden tehtävän luonti eli topic, priority, status, description, sitten save
        cy.get('#topic').type('luotu tehtävä');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();
        // tarkista että on olemassa
        cy.get('#task-list').should('contain', 'luotu tehtävä');
        cy.wait(2000);
    });

    // yritin ensin implementoida niin että käytettäisiin samaa tehtävää kaikissa testeissä,
    // mutta oli paljon helpompi luoda jokaiseen oman. Tekoälyn mukaan se on myös parempi näin,
    // koska testit ovat itsenäisempiä, eikä yhden testin epäonnistuminen vaikuta toiseen.

    // muokkaa tehtävä
    it('should edit an existing task', () => {
        cy.get('#topic').type('Muokattava tehtävä');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();
        cy.wait(2000);
        // muokkaa tehtövää: avaa, clear and type.
        // käytetään first(), jotta valittaisiin vain ensimmäisen mätsin
        cy.get('.task button[data-action="edit"]').first().click();
        cy.get('#topic').clear().type('Muokattu!');
        cy.get('#save-btn').click();
        cy.wait(2000);
        // tarkista että se muokkautui
        cy.get('#task-list').should('contain', 'Muokattu!');
        cy.wait(2000);
    });

    // merkitse tehtävä tehdyksi
    it('should mark a task as done', () => {
        cy.get('#topic').type('Task to be done');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();
        // klikkaa edit
        cy.get('.task button[data-action="complete"]').first().click();
        cy.wait(2000);
        // tarkista että on done tilassa
        cy.get('.task').first().should('have.class', 'done');
        cy.wait(2000);
    });

    // merkitse tehtävä takaisin kesken tilaan
    it('should undo a completed task', () => {
        cy.get('#topic').type('Undo task');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();
        // ensimmäinen klikkaus = done
        cy.get('.task button[data-action="complete"]').first().click();
        cy.wait(2000);
        // toinen klikkaus = undo
        cy.get('.task button[data-action="complete"]').first().click();
        // tarkista että ei ole done tilassa
        cy.get('.task').first().should('not.have.class', 'done');
        cy.wait(2000);
    });

    // poista tehtävä
    it('should delete a task', () => {
        cy.get('#topic').type('Delete task');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();
        cy.wait(2000);
        // cy.on estää ongelman, jossa browserin confirm boksi estää testin
        // tämä hyväksyy sen automaattisesti
        cy.on('window:confirm', () => true);
        cy.get('.task button[data-action="delete"]').first().click();
        cy.get('#task-list').should('not.contain', 'Delete task');
        cy.wait(1000);
    });

    // näytä tyhjä näkymä, kun ei ole tehtäviä
    it('should display empty state when no tasks exist', () => {
        cy.get('#task-list').should('be.empty');
        cy.get('#empty-state').should('be.visible');
    });

    // tässä viimeisessä osiossa kysyin tekoälyltä mitä testejä kannattaa tehdä,
    // ja valitsin nämä, rakensin testit itsenäisesti muiden testien pohjalta.
    // Koin että tämä yksi testi riittää hyvin näyttämään että prioriteetti filtteri toimii.

    // filteröi taskeja, näkyykö ne oikein?
    // päätin laittaa nää kaikki samaan it:iin jotta ei tarvis joka kerta luoda uudet taskit.
    it('should filter tasks by priority', () => {
        cy.get('#topic').type('High Prio task');
        cy.get('#priority').select('high');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();

        cy.get('#topic').type('Med Prio task');
        cy.get('#priority').select('medium');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();

        cy.get('#topic').type('Low Prio task');
        cy.get('#priority').select('low');
        cy.get('#status').select('todo');
        cy.get('#description').type('text');
        cy.get('#save-btn').click();

        cy.wait(1000);

        // pari eri prioriteetin taskia luotu, nyt voidaan tarkistaa toimiiko filtteri
        cy.get('[data-priority="high"]').click();
        cy.get('#task-list').should('contain', 'High Prio task');
        cy.get('#task-list').should('not.contain', 'Med Prio task');
        cy.get('#task-list').should('not.contain', 'Low Prio task');
        cy.wait(1000);

        cy.get('[data-priority="medium"]').click();
        cy.get('#task-list').should('contain', 'Med Prio task');
        cy.get('#task-list').should('not.contain', 'Low Prio task');
        cy.get('#task-list').should('not.contain', 'High Prio task');
        cy.wait(1000);

        cy.get('[data-priority="low"]').click();
        cy.get('#task-list').should('contain', 'Low Prio task');
        cy.get('#task-list').should('not.contain', 'Med Prio task');
        cy.get('#task-list').should('not.contain', 'High Prio task');
        cy.wait(1000);

        // näyttää jälleen kaikki taskit, kun valitaan all.
        cy.get('[data-priority="all"]').click();
        cy.get('#task-list').should('contain', 'High Prio task');
        cy.get('#task-list').should('contain', 'Med Prio task');
        cy.get('#task-list').should('contain', 'Low Prio task');
        cy.wait(1000);
    });
});
