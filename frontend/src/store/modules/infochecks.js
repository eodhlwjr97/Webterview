// import router from "@/router";
import axios from "axios";
import drf from "@/api/drf";
import router from "@/router";

export default {
  state: {
    // 일단 Error관련 코드 없으니까 지워도 되는데 유예
    infoError: null,
    isValid: false,
    rightCode: "",

    roomNo: "",
    urlError: false,

    raterNo: "",
    applicantEmail: "",
    applicantNo: "",
    newApplicant: "",
    isApplicantCheck: false,

    raterGroupNo: "",
  },
  getters: {
    infoError: (state) => state.infoError,
    isValid: (state) => state.isValid,
    rightCode: (state) => state.rightCode,

    roomNo: (state) => state.roomNo,
    roomCode: (state) => state.roomCode,
    urlError: (state) => state.urlError,

    raterNo: (state) => state.raterNo,
    applicantNo: (state) => state.applicantNo,
    applicantEmail: (state) => state.applicantEmail,
    newApplicant: (state) => state.newApplicant,
    isApplicantCheck: (state) => state.isApplicantCheck,

    raterGroupNo: (state) => state.raterGroupNo,
  },
  mutations: {
    SET_INFO_ERROR: (state, error) => (state.infoError = error),
    SET_VALID: (state, isValid) => (state.isValid = isValid),
    SET_CODE: (state, rightCode) => (state.rightCode = rightCode),

    SET_ROOMNO: (state, roomNo) => (state.roomNo = roomNo),
    SET_ROOMCODE: (state, roomCode) => (state.roomCode = roomCode),
    SET_URLERROR: (state, urlError) => (state.urlError = urlError),

    SET_RATERNO: (state, raterNo) => (state.raterNo = raterNo),
    SET_EMAIL: (state, applicantEmail) =>
      (state.applicantEmail = applicantEmail),
    SET_APPLICANTNO: (state, applicantNo) => (state.applicantNo = applicantNo),
    SET_NEW: (state, newApplicant) => (state.newApplicant = newApplicant),
    SET_CHECK: (state, isApplicantCheck) =>
      (state.isApplicantCheck = isApplicantCheck),

    SET_RATERGROUPNO: (state, raterGroupNo) => (state.raterGroupNo = raterGroupNo)
  },
  actions: {
    // url 복호화
    async urlDecrypt({ dispatch, commit }, code) {
      console.log("url: " + code);
      console.log(encodeURI(drf.admins.urlDecrypt(code)));
      await axios({
        url: drf.admins.urlDecrypt(code),
        method: "get",
        data: code,
      })
        .then((res) => {
          // {message : success / fail}
          if (res.data.message === "success") {
            dispatch("saveRoomNo", res.data.roomNo);
            dispatch("saveRoomCode", res.data.roomCode);
            console.log(res.data.roomCode);
          } else {
            // 잘못된 url
            console.log(res.data.message);
            console.log("유효한 주소가 아닙니다");
            commit("SET_URLERROR", true);
            router.push({name: 'NotFound404'})
          }
        })
        .catch((err) => {
          // 복호화 실패
          console.error(err.response.data);
        });
    },

    saveRoomNo({ commit }, roomNo) {
      commit("SET_ROOMNO", roomNo);
      localStorage.setItem("roomNo", roomNo);
    },
    saveRoomCode({ commit }, roomCode) {
      commit("SET_ROOMCODE", roomCode);
      localStorage.setItem("roomCode", roomCode);
    },

    // FORM
    sendInfo({ dispatch, commit }, certified) {
      console.log(certified);
      axios({
        url: drf.interviews.sendInfo(),
        // url: "https://i7c205.p.ssafy.io/api/interview/confirm",
        method: "post",
        data: certified,
      })
        .then((res) => {
          // {message : success / fail}
          // 성공 : 정보가 DB에 존재한다.
          // 중복 검사할때
          console.log(res.data);
          if (res.data.message === "success") {
            dispatch("checkInfo", true);

            if (certified.type === "rater") {
              console.log(res.data.rater.raterNo, "raterNo에 저장");
              console.log(res.data.rater.groupNo, "groupNo에 저장");
              console.log(res.data.rater.userNo, 'userNo에 저장')
              commit("SET_RATERNO", res.data.rater.raterNo);
              commit("SET_RATERGROUPNO", res.data.rater.groupNo);
              dispatch('readGroup', res.data.rater.userNo);
            } else {
              console.log();
              commit("SET_EMAIL", res.data.applicant.applicantEmail);
              commit("SET_APPLICANTNO", res.data.applicant.applicantNo);
            }
          } else {
            console.log("유효한 면접관/지원자가 없습니다");
            console.log(res.data.error);
            dispatch("checkInfo", false);
          }
        })
        .catch((err) => {
          console.error(err.response.data);
        });
    },
    checkInfo({ commit }, isValid) {
      commit("SET_VALID", isValid);
      localStorage.setItem("isValid", isValid);
    },
    sendsms({ dispatch }, certified) {
      console.log(certified.phone);
      console.log(certified.codeNum);
      axios({
        // url: drf.naverapis.sendsms(),
        // url: "https://i7c205.p.ssafy.io/api/naverapi/sms",
        url: "/api/naverapi/sms",
        method: "post",
        data: {
          recipientPhoneNumber: certified.phone,
          content: certified.codeNum, // 5자리 랜덤 숫자
        },
        headers: {
          "Content-Type": "application/json",
          "access-token": localStorage.getItem("token"),
        },
      })
        .then((res) => {
          console.log("성공했다");
          console.log(res.data);
          dispatch("showcode", "test");
        })
        .catch((err) => {
          console.log("실패했다");
          console.error(err.response.data);
        });
    },
    showcode({ commit }, rightCode) {
      commit("SET_CODE", rightCode);
      localStorage.setItem("rightCode", rightCode);
      // console.log(rightCode); // content 가 찍힌다 (숫자가 아닌 content literally)
    },
    async setEmail({ commit, dispatch, getters }, applicantEmail) {
      await console.log("setEmail: " + applicantEmail);
      await commit("SET_EMAIL", applicantEmail);
      // 이메일로 지원자 정보 가져오기(홍)
      console.log("참가한 지원자 정보 가져오는 중...");
      
      // 지원자 정보 가져오기 (홍)
      await axios({
        url: drf.applicants.applicant(),
        // url: '/interview'+'/applicant'+'/info',
        method: 'get',
        params: {
          email: applicantEmail,
          groupNo: getters.raterGroupNo
        },
        headers: getters.authHeader,
      })
        .then(res => {
          console.log(res.data)
          if (res.data.message === 'success') {
            console.log(res.data.applicant)
            dispatch('saveApplicant', res.data.applicant)
            commit('SET_CURRENTAPPLICANT', res.data.applicant)
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    async setCheck({ commit }, isApplicantCheck) {
      await console.log("setCheck: " + isApplicantCheck);
      await commit("SET_CHECK", isApplicantCheck);
    },
    async setNo({ commit }, applicantNo) {
      await console.log("setNo: " + applicantNo);
      await commit("SET_APPLICANTNO", applicantNo);
    },
    setNew({ commit }, newApplicant) {
      commit("SET_NEW", newApplicant);
      console.log("setNew: " + this.newApplicant);
      localStorage.setItem("roomList", newApplicant);
    },
  },
};
