<template>
  <AuthLayout>
    <section class="auth">
      <div class="auth__main">
        <div class="auth__main__close">
          <button>
            <BaseIcon icon="close" />
          </button>
        </div>
        <form class="auth__form" action="">
          <div class="auth__form-content">
            <h3>Sign Up</h3>
            <p>Create an account to start designing</p>
          </div>
          <div class="auth__form-inputs">
            <div class="auth__form__row">
              <FormGroup>
                <BaseLabel title="First Name" />
                <BaseInput type="text" placeholder="First name" />
              </FormGroup>
              <FormGroup>
                <BaseLabel title="Last Name" />
                <BaseInput type="text" placeholder="Last name" />
              </FormGroup>
            </div>
            <FormGroup>
              <BaseLabel title="Email" />
              <BaseInput type="email" placeholder="Email address" />
            </FormGroup>
            <FormGroup>
              <BaseLabel title="Country" />
              <BaseSelect
                title="Select country"
                :options="['Nigeria', 'Ghana', 'Togo', 'France']"
              />
            </FormGroup>
            <FormGroup>
              <BaseLabel title="Password" />
              <BaseInput type="password" placeholder="Password" />
            </FormGroup>
          </div>
          <div class="auth__submit">
            <p>
              By clicking the button below, you accept our
              <a href="">Terms of Use</a> and <a href="">Privacy Policy</a>
            </p>
            <BaseButton />
          </div>
        </form>
        <div class="form__footer">
          <p>
            Already have an account?
            <router-link to="/login">Sign in here</router-link>
          </p>
        </div>
      </div>
    </section>
  </AuthLayout>
</template>
<script>
import { defineComponent } from "vue";
import AuthLayout from "@/components/layout/AuthLayout";
import BaseIcon from "@/components/icon/BaseIcon";
import FormGroup from "@/components/layout/FormGroup";
import BaseLabel from "@/components/form/BaseLabel";
import BaseInput from "@/components/form/BaseInput";
import BaseButton from "@/components/layout/BaseButton";
import BaseSelect from "@/components/form/BaseSelect";

export default defineComponent({
  name: "RegisterPage",
  components: {
    BaseSelect,
    BaseButton,
    BaseInput,
    BaseLabel,
    FormGroup,
    BaseIcon,
    AuthLayout,
  },
});
</script>
