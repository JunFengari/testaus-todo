import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    loadTasks,
    saveTasks,
    addTask,
    toggleTask,
    deleteTask,
} from '../public/modelfortests.js';
// laitoin funktiot erilliseen tiedostoon testausta varten

// Testisuunnitelmassani oli vähän puutteita, joten korjasin listan tähän paremmaksi.
// Testaan tässä tehtävien näyttämisen, talentuminen, päivityksen, done/undo, poisto, ja myöhemmin prioriteetti filtering.

// Tässä tehtävässä käytin tekoälyä korjaamaan localstorage ongelmaa, jossa piti simuiloida uuden varaston jotta sais tehtyä testit.
// Käytin myös tekoälyä ehdottamaan testien struktuuria, ja eniten niiten korjaamisessa kun testit heitti erroria.

describe('basic functions of tasks', () => {
    // --Näytä tehtävät--
    // palauta tyhjä näkymä jos ei ole tehtäviä
    it('show empty array if there are no tasks', () => {
        // clear LocalStorage
        saveTasks([]);

        // load tasks
        const tasks = loadTasks();

        //check that it is empty, returns empty array
        expect(tasks).toEqual([]);
    });

    // palauta tehtävät jos niitä on olemassa
    it('show tasks if they exist', () => {
        // make template task
        const temptask = { id: 't1', topic: 'Test', completed: false };
        saveTasks([temptask]);

        //load the task just created
        const tasks = loadTasks();

        // check that it exists there
        expect(tasks.length).toBe(1);
        expect(tasks[0].topic).toBe('Test');
    });

    // --Tallenna tehtävä--
    it('save a task', () => {
        // clear localStorage, create a task payload and add it to an empty list
        saveTasks([]);
        const temptask = {
            topic: 'Save Test',
            completed: false,
            status: 'todo',
        };

        // tässä oli joku ongelma taas localStoragen kanssa, sen takia tässä on tehty uusi lista
        const newList = addTask([], temptask);
        saveTasks(newList);

        // load tasks, check length, check it's the right task
        const tasks = loadTasks();
        expect(tasks.length).toBe(1);
        expect(tasks[0].topic).toBe('Save Test');
    });

    //--Päivitä tehtävä--
    it('should properly edit the task', () => {
        // create a new task, save it
        const ogtask = { topic: 'Original', completed: false, status: 'todo' };
        let tasks = addTask([], ogtask);
        saveTasks(tasks);

        // Load the task, and then edit the title
        tasks = loadTasks();
        const editabletask = { ...tasks[0], topic: 'Edited version' };

        // replacing the old task:
        tasks = tasks.map((t) => (t.id === editabletask.id ? editabletask : t));
        saveTasks(tasks);

        // checking that it worked by loading the tasks, checking length
        // and checking each field separately
        const updatedTasks = loadTasks();
        expect(updatedTasks.length).toBe(1);
        expect(updatedTasks[0].topic).toBe('Edited version');
        expect(updatedTasks[0].completed).toBe(false);
        expect(updatedTasks[0].status).toBe('todo');
    });

    //--Tehtävä done/undo--
    it('should allow toggling done/undo, several times', () => {
        // create and save new task
        const newtask = {
            topic: 'done/undo test',
            completed: false,
            status: 'todo',
        };
        let tasks = addTask([], newtask);
        saveTasks(tasks);

        // load the task, toggle done
        tasks = loadTasks();
        tasks = toggleTask(tasks, tasks[0].id);
        saveTasks(tasks);

        // check that it worked
        let updatedtask = loadTasks();
        expect(updatedtask[0].completed).toBe(true);

        // test that we can undo it too
        tasks = toggleTask(updatedtask, updatedtask[0].id);
        saveTasks(tasks);

        // check that undo worked
        updatedtask = loadTasks();
        expect(updatedtask[0].completed).toBe(false);
    });

    //--Poista tehtävä--
    it('should delete a task', () => {
        // create task, load it, save it
        const deletabletask = {
            topic: 'deleteme!',
            completed: true,
            status: 'done',
        };
        let tasks = addTask([], deletabletask);
        saveTasks(tasks);

        // load the task, delete it, save
        tasks = loadTasks();
        tasks = deleteTask(tasks, tasks[0].id);
        saveTasks(tasks);

        // check that the task is gone
        const updatedtasks = loadTasks();
        expect(updatedtasks.length).toBe(0);
    });
});

//--Myöhemmin lisää prioriteetti organisointi tähän--
