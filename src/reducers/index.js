// import axios from 'axios';

// const initialState = {
//     campuses: [],
//     students: [],
//   }
//   //----------------------------------------------------
  
//   const GET_CAMPUSES = 'GET_CAMPUSES';
//   const GET_CAMPUS = 'GET_CAMPUS';
//   const GET_STUDENTS = 'GET_STUDENTS';
//   const GET_STUDENT = 'GET_STUDENT';
//   const REMOVE_CAMPUS = 'REMOVE_CAMPUS';
//   const REMOVE_STUDENT = 'REMOVE_STUDENT';
//   const EDIT_CAMPUS = 'EDIT_CAMPUS';
//   const EDIT_STUDENT = 'EDIT_STUDENT';
  
  
//   //----------------------------------------------------
//   export function getCampuses (campuses) {
//       const action = { type: GET_CAMPUSES, campuses };
//       return action;
//   }
  
//   export function getCampus (campus) {
//     const action = { type: GET_CAMPUS, campus };
//     return action;
//   }
  
//   export function getStudents (students) {
//     const action = { type: GET_STUDENTS, students };
//     return action;
//   }
  
//   export function getStudent (student) {
//     const action = { type: GET_STUDENT, student };
//     return action;
//   }
  
//   export function removeCampus (campusId) {
//     const action = { type: REMOVE_CAMPUS, campusId};
//     return action;
//   }
  
//   export function removeStudent (studentId) {
//     const action = { type: REMOVE_STUDENT, studentId};
//     return action;
//   }
  
//   export function editCampus (campus) {
//     const action = { type: EDIT_CAMPUS, campus};
//     return action;
//   }
  
//   export function editStudent (student) {
//     const action = { type: EDIT_STUDENT, student};
//     return action;
//   }
  
//   //----------------------------------------------------
//   export function fetchCampuses () {
  
//       return function thunk (dispatch) {
//           axios.get('/api/campuses')
//               .then(res => res.data)
//               .then(campuses => {
//               dispatch(getCampuses(campuses))}
//               );
//       }
//   }
  
  
//   export function fetchStudents () {
    
//     return function thunk (dispatch) {
//         axios.get('/api/students')
//             .then(res => res.data)
//             .then(students => {
//             dispatch(getStudents(students))}
//             );
//     }
//   }
  
  
//   export function fetchStudent (studentId) {
    
//     return function thunk (dispatch) {
//         axios.get(`/api/students/${studentId}`)
//             .then(res => res.data)
//             .then(student => {
//             dispatch(getStudent(student))}
//             );
//     }
//   }
  
  
//   export function postCampus (campus, history) {
  
//       return function thunk (dispatch) {
//           axios.post('/api/campuses', campus)
//               .then(res => (res.data))
//               .then(newCampus => {
//               dispatch(getCampus(newCampus));
//               history.push(`/campuses/${newCampus.id}`);
//             });
//       }
//   }
  
  
//   export function postStudent (student, history) {
//         return function thunk (dispatch) {
//             axios.post('/api/students', student)
//                 .then(res => (res.data))
//                 .then(newStudent => {
//                 dispatch(getStudent(newStudent));
//                 history.push(`/students/${newStudent.id}`);
//               });
//         }
//   }
  
  
//   export function deleteStudent (studentId) {
//     return function thunk (dispatch) {
//       dispatch(removeStudent(studentId))
//       axios.delete(`/api/students/${studentId}`)
//           .catch(err => console.error(`Removing student: ${studentId} unsuccesful`, err));
//     }
//   }
  
  
//   export function deleteCampus (campusId) {
//     return function thunk (dispatch) {
//       dispatch(removeCampus(campusId))
//       axios.delete(`/api/campuses/${campusId}`)
//         .then(() => dispatch(fetchStudents()))
//           .catch(err => console.error(`Removing campus: ${campusId} unsuccesful`, err));
//     }
//   }
  
  
//   export function putCampus (campus, history) {
//     return function thunk (dispatch) {
//       axios.put(`/api/campuses/${campus.id}`, {name: campus.name, image: campus.image})
//           .then(res => res.data)
//           .then(editedCampus => {
//             dispatch(editCampus(editedCampus));
//             history.push(`/campuses/${editedCampus.id}`);
//           })
//     }
//   }
  
  
//   export function putStudent (student, history) {
//     return function thunk (dispatch) {
//       console.log('putting student...., student: ', student)
//       axios.put(`/api/students/${student.id}`, {name: student.name, image: student.image, campusId: student.campusId})
//           .then(res => res.data)
//           .then(editedStudent => {
//             console.log('dispatching editStudent...')
//             dispatch(editStudent(editedStudent));
//             history.push(`/students/${editedStudent.id}`);
//           })
//     }
//   }
  
  
//   //----------------------------------------------------
//   export default function reducer (state = initialState, action) {
//       switch (action.type) {
  
//           case GET_CAMPUSES:
//               return Object.assign({}, state, {campuses: action.campuses});
  
//           case GET_CAMPUS:
//               return Object.assign({}, state, {campuses: [...state.campuses, action.campus]})
          
//           case GET_STUDENTS:
//               return Object.assign({}, state, {students: action.students});
  
//           case GET_STUDENT:
//               return Object.assign({}, state, {students: [...state.students, action.student]});
  
//           case REMOVE_STUDENT:
//               const newStudents = state.students.filter(student => student.id !== Number(action.studentId))
//               return Object.assign({}, state, {students: newStudents});
  
//           case REMOVE_CAMPUS:
//               const newCampuses = state.campuses.filter(campus => campus.id !== Number(action.campusId))
//               return Object.assign({}, state, {campuses: newCampuses});
  
//           case EDIT_CAMPUS:
//               const editedCampuses = state.campuses.filter(campus => campus.id !== Number(action.campus.id))
//               return Object.assign({}, state, {campuses: [...editedCampuses, action.campus]});
  
//           case EDIT_STUDENT:
//           const editedStudents = state.students.filter(student => student.id !== Number(action.student.id))
//           return Object.assign({}, state, {students: [...editedStudents, action.student]});
  
//           default:
//               return state;
//       }
//   }