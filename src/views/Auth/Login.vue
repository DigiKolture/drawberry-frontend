<template>
  <BaseLayout>
    <h1>Login</h1>
  </BaseLayout>
</template>
<script>
import { defineComponent } from "vue";
import BaseLayout from "@/components/layout/AuthLayout";

export default defineComponent({
  name: "LoginPage",
  components: { BaseLayout },
});
</script>
