import '../App.css';
import React,{useState} from 'react';
import Lesson from './Lesson.js'
import Connector from './Connector.js';
import LessonPage from './LessonPage.js';
import LessonCounter from './LessonCounter.js';

function isCompleted(lesson, state) {
    if (state[lesson]) {
        return true
    }
    return false
}

function isUnlocked(lesson, state, lessons) {
    for (let prerequisite of lessons[lesson].prerequisites) {
        let found_option = false
        for (let option of prerequisite) {
            if (isCompleted(option, state, lessons)) {
                found_option = true
                break
            }
        }
        if (!found_option) {
            return false
        }
    }
    return true
}

function isThreshold(lesson, state, lessons) {
    for (let prerequisite of lessons[lesson].prerequisites) {
        let found_option = false
        for (let option of prerequisite) {
            if (isUnlocked(option, state, lessons)) {
                found_option = true
                break
            }
        }
        if (!found_option) {
            return false
        }
    }
    return true
}

function buildLessonStates(state, lessons) {
    let showLater = state._show_later?true:false
    let ret = {}
    for (let lesson in lessons) {
        let c = isCompleted(lesson, state, lessons)
        let u = c || isUnlocked(lesson, state, lessons)
        let t =  c || u || isThreshold(lesson, state, lessons) || showLater
        let s = u || showLater
        ret[lesson] = {
            completed: c,
            unlocked: u,
            threshold: t,
            selectable: s,
        }
    }
    return ret
}

function Board({ lessons, state, onChange }) {
    const [currentPage, setCurrentPage] = useState(Object.keys(lessons)[0])
    const [pageOpen, setPageOpen] = useState(false)
    const builtLessons = buildLessonStates(state, lessons)
    return (
        <div>
            {Object.keys(lessons).map((key) => (
                <Lesson
                    lesson={lessons[key]}
                    state={builtLessons[key]}
                    onSetPage={() => {
                        setCurrentPage(key)
                        setPageOpen(true)
                    }}
                />
            ))}
            {Object.keys(lessons).map((key) => (
                lessons[key].prerequisites.map((options) => (
                    options.map((option) => (
                        <Connector
                            lesson1={lessons[option]}
                            lesson2={lessons[key]}
                            state1={builtLessons[option]}
                            state2={builtLessons[key]}
                        />
                    ))
                ))
            ))}
            <LessonPage
                lesson={lessons[currentPage]}
                state={builtLessons[currentPage]}
                onChange={(newState) => (
                    onChange({
                        ...state,
                        [currentPage]: newState
                    })
                )}
                onClose={() => {setPageOpen(false)}}
                isOpen={pageOpen}
            />
            <LessonCounter lessonStates={builtLessons}/>
        </div>
    )
}




export default Board;