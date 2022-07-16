import { createAction, createSlice } from "@reduxjs/toolkit";
import commentService from "../services/comment.service";
import { nanoid } from "nanoid";
import { getUserId } from "../services/localStorage.service";

const commentsSlice = createSlice({
    name: "comments",
    initialState: {
        entities: null,
        isLoading: true,
        error: null
    },
    reducers: {
        commentsRequested: (state) => {
            state.isLoading = true;
        },
        commentsReceved: (state, action) => {
            state.entities = action.payload;
            state.isLoading = false;
        },
        commentsRequestFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        commentCreated: (state, action) => {
            state.entities.push(action.payload);
        },
        commentDeleted: (state, action) => {
            console.log(state.entities);
            state.entities = state.entities.filter(
                (c) => c._id !== action.payload
            );
        }
    }
});

const { reducer: commentsReducer, actions } = commentsSlice;
const {
    commentDeleted,
    commentsRequested,
    commentsReceved,
    commentsRequestFailed,
    commentCreated
} = actions;

const addCommentRequested = createAction("comments/addCommentRequested");
const deleteCommentRequested = createAction("comments/deleteCommentRequested");

export const loadCommentsList = (userId) => async (dispatch) => {
    dispatch(commentsRequested());
    try {
        const { content } = await commentService.getComments(userId);
        dispatch(commentsReceved(content));
    } catch (error) {
        dispatch(commentsRequestFailed(error.message));
    }
};

export const getComments = () => (state) => state.comments.entities;
export const getCommentsLoadingStatus = () => (state) =>
    state.comments.isLoading;

export const createComment = (payload) => async (dispatch, getState) => {
    dispatch(addCommentRequested(payload));

    try {
        const comment = {
            ...payload,
            _id: nanoid(),
            created_at: Date.now(),
            userId: getUserId()
        };
        const { content } = await commentService.createComment(comment);
        dispatch(commentCreated(content));
    } catch (error) {
        dispatch(commentsRequestFailed(error.message));
    }
};
export const removeComment = (commentId) => async (dispatch) => {
    dispatch(deleteCommentRequested());
    try {
        await commentService.removeComment(commentId);
        dispatch(commentDeleted(commentId));
    } catch (error) {
        dispatch(commentsRequestFailed(error.message));
    }
};
export default commentsReducer;
