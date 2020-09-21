
 <template>
  <div>
    <h1>11111{{this.name}}</h1>
  </div>
</template>
 <script>
export default {
  data () {
    return {
      name: this.$route.params.name,

    }
  }


}
 </script>
 <style scoped>
</style>