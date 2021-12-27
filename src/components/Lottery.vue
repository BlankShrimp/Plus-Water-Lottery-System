<template>
  <div id="lottery-box">
    <div id="input-box">
      <b-form inline>
        <label class="sr-only" for="prize">prie</label>
        <b-form-input id="prize" placeholder="奖品"></b-form-input>
        <label class="sr-only" for="number">number</label>
        <b-form-spinbutton id="number" v-model="value"></b-form-spinbutton>
        <b-button id="execute" variant="danger">抽！</b-button>
      </b-form>
    </div>

    <div id="name-list-box">
    </div>
  </div>
</template>

<style>
.selector-for-some-widget {
  box-sizing: content-box;
}
#spin {

}
</style>

<script>
export default {
  name: 'spin',
  data () {
    return {
      value: 1
    }
  }
}
</script>
