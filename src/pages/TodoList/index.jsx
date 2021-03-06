import React, {  useEffect } from 'react';
import { connect } from 'react-redux'
import Todo from '../../components/Todo';
import { createTodo, deleteTodo, updateTodo, selectTodo, toggleEditMode, deleteSelectedTodos, fetchTodos } from '../../actions/todo';
import { showNotificationRequest } from '../../actions/notification';
import styles from './style.module.css';
import {MdAdd, MdDelete, MdArrowUpward, MdArrowForward} from 'react-icons/md'
import {TransitionGroup, CSSTransition} from 'react-transition-group';
import {useHistory, useRouteMatch, Link} from 'react-router-dom';
import classnames from 'classnames';
import { useState } from 'react';
import { useRef } from 'react';

function TodoList(props){
    const [inputNewTodoActive, setInputNewTodoActive] = useState(false);
    const [inputNewTodoError, setInputNewTodoError] = useState(false);
    const inputNewTodoRef = useRef(null);

    let match = useRouteMatch();
    let history = useHistory();

    useEffect(()=>{
        props.fetchTodos(match.params.parentTodoId);
    }, [match.params.parentTodoId]);

    useEffect(()=>{
        if(inputNewTodoError)
            props.showNotificationRequest('You must give a description to your todo.', null, 'error');
    }, [inputNewTodoError])

    useEffect(()=>{
        if(inputNewTodoRef){
            if(inputNewTodoActive)
                inputNewTodoRef.current.focus();
            else
                inputNewTodoRef.current.blur();
        }
    }, [inputNewTodoActive]);

    const showInputNewTodo = () => {
        setInputNewTodoError(false);
        if(!inputNewTodoActive){
            setInputNewTodoActive(true);
        }else{
            createTodo();
        }
    }

    const onInputNewTodoKeyUp = (e) => {
        if(e.keyCode === 13){
            createTodo();
        }else{
            setInputNewTodoError(false);
        }
    }

    const createTodo = () => {
        let description = inputNewTodoRef.current.value;
        if(description === ""){
            setInputNewTodoError(true);
        }else{
            setInputNewTodoError(false);
            props.createTodo(match.params.parentTodoId, description);
            inputNewTodoRef.current.value = "";
        }
    }

    const openTodo = (id) => {
        history.push(`/todos/${id}`)
    }

    const goBack = () => {
        if(match.params.parentTodoId !== undefined){
            let grandParentTodoId = props.todo.grandParentTodoId;
            history.push(`/todos/${grandParentTodoId ? grandParentTodoId:''}`)
        }
    }

    const getWelcomeText = () => {
        let hours = (new Date()).getHours();
        if(hours >= 0 && hours <= 11)
            return 'Good morning, here are your todos';
        else if(hours >= 12 && hours <= 17)
            return 'Good afternoon, here are your todos';
        else
            return 'Good evening, here are your todos';
    }
    
    const getTitle = () => {
        return match.params.parentTodoId ? props.todo.parentTodoDescription:getWelcomeText();
    }

    const getParentsLink = ()=>{
        let parents = props.todo.parents.slice()
        if(props.todo.parentTodoId)
            parents.push({todoId: null, description: "Go back to the top"})  
        parents.reverse()
        parents.push({todoId: props.todo.parentTodoId || null, description: getTitle()});
        
        let links = parents.map((e, i) => {
            let title = (i === parents.length - 1);
            let opacity = 1.0 - (0.07 * (parents.length - i));

            return (
                <CSSTransition
                    key={e.todoId}
                    timeout={200}
                    classNames={"parent-link"}
                >
                    <li data-id={e.todoId}>
                        {!title ? <MdArrowForward size={18}/>:null}
                        {!title ? <Link style={{opacity: opacity}} to={e.todoId ? `/todos/${e.todoId}`:`/todos`}>{e.description}</Link>:<a style={{opacity: opacity}} href="#">{e.description}</a>}
                    </li>
                </CSSTransition>
            )
        });

        return (
            <TransitionGroup className={styles.parents}>{links}</TransitionGroup>
        )
    }
    
    let todos = props.todo.data.map((e) => {
            return (
                <CSSTransition
                    key={e.todoId}
                    timeout={1000}
                    classNames={"item"}
                >
                    <Todo
                        {...e}
                        onOpen={()=>{openTodo(e.todoId)}}
                        onSelect={()=>{props.selectTodo(e.todoId)}}
                        onDelete={()=>{props.deleteTodo(e.todoId)}}
                        onComplete={()=>{props.completeTodo(e.todoId, !e.completed)}}
                        onEditDescription={(description)=>{props.editTodoDescription(e.todoId, description)}}
                        toggleEditMode={()=>{props.toggleEditMode(e.todoId)}}
                    />
                </CSSTransition>
            )
        }
    );

    let deleteButtonClasses = classnames(styles['action-button'], styles['delete-action-button'], !props.todo.allowDeletion ? styles['disabled']:'')
    let goBackClasses = classnames(styles['action-button'], match.params.parentTodoId === undefined ? styles['disabled']:'');
    let inputNewTodoClasses = classnames(
        styles['input-new-todo'],
        inputNewTodoActive === true ? styles['active']:'',
        inputNewTodoError === true ? styles['error']:''
    );

    return (
        <div className={styles.TodoList}>
            <div className={styles.content}>
                <div className={styles.header}>
                    {getParentsLink()}
                </div>
                <div className={styles.menu}>
                    <div className={styles.actions}>
                        <div onClick={goBack} className={goBackClasses} title={'Go back.'}> 
                            <MdArrowUpward size={24}/>
                        </div> 
                        <div onClick={props.deleteSelectedTodos} className={deleteButtonClasses} title={'Delete selected todos.'}> 
                            <MdDelete size={24}/>
                        </div>
                        <div className={inputNewTodoClasses}>
                            <input ref={inputNewTodoRef} onKeyUp={onInputNewTodoKeyUp} type="text" placeholder="Describe a new todo..."/>
                        </div>
                        <div onClick={showInputNewTodo} className={classnames(styles['action-button'], styles['add-action-button'])} title={'Add todo.'}> 
                            <MdAdd size={24}/>
                        </div>
                    </div>
                </div>
                <div>
                    <TransitionGroup appear>    
                        {todos}
                    </TransitionGroup>
                </div>
            </div>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {...state};
}

const mapDispatchToProps = dispatch => {
    return {
        createTodo: (parentTodoId, description) => {
            dispatch(createTodo(parentTodoId, description));
        },
        deleteTodo: todoId => {
            dispatch(deleteTodo(todoId));
        },
        completeTodo: (todoId, completed) => {
            dispatch(updateTodo(todoId, {completed}));
        },
        editTodoDescription: (todoId, description) => {
            dispatch(updateTodo(todoId, {description}));
        },
        selectTodo: todoId => {
            dispatch(selectTodo(todoId))
        },
        toggleEditMode: todoId => {
            dispatch(toggleEditMode(todoId))
        },
        deleteSelectedTodos: () => {
            dispatch(deleteSelectedTodos())
        }, 
        fetchTodos: (parentTodoId) => {
            dispatch(fetchTodos(parentTodoId))
        }, 
        showNotificationRequest: (caption, body, type) => {
            dispatch(showNotificationRequest(caption, body, type))
        }
    }
}

const ConnectedTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList);
 
export default ConnectedTodoList