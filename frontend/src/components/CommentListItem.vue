<template>
  <!-- {{ comment }} -->
  <div class="d-flex justify-content-between">
    <li class="d-flex mt-2 txt1">
      <div>{{ comment.userName }} : {{ comment.commentAnswer }}</div>
      <button v-if="profile.userName == comment.userName" class="deleteCommentBtn" @click="deleteComment(comment)">삭제</button>
    </li>
    <div class="d-flex align-items-center">
      <div class="txt1">{{ changeDate(comment.commentRegDate) }}</div>
    </div>
  </div>
  
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CommentListItem',
  props: { comment: Object },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters(['currentUser', 'comments', 'profile']),
  },
  methods: {
    ...mapActions(['deleteComment']),
    changeDate(date) {
        const moment = require('moment-timezone')
        const time = moment(date).tz("Asia/Seoul").format('YYYY-MM-DD HH:mm');
        return time
      }
  },
  created() {
    
  }

}
</script>

<style scoped>
/* .comment-list-item {
  border: 1px bold #121212;
  font-size: 1.2rem;
} */

.deleteCommentBtn{
  font-family: Poppins-Regular;
  font-size: 13px;
  line-height: 1.5;
  color: #999999;
  background-color: #f5f5f5;
  border-radius: 15%;
}
</style>