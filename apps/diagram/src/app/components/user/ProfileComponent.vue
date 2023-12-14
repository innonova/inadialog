<script setup lang="ts">
import { computed } from 'vue';

import { User } from 'firebase/auth';

const props = defineProps<{
  profile: User | null | undefined
}>();

const backgroundColor = computed(() => 'lightblue');
const hasProfilePicture =
  computed(() => props.profile && !props.profile.isAnonymous && !!props.profile.photoURL);
const username =
  computed(() => props.profile &&
    !!props.profile.displayName &&
    props.profile.displayName[0] ||
    'Anonymous');
const firstLetter = computed(() => username.value[0]);
</script>

<template>
    <div id="profile">
        <div class="profile-picture" :style="{ background: backgroundColor }" :title="username">
            <img v-if="hasProfilePicture">
            <p v-else class="display-name">
                {{ firstLetter }}
            </p>
        </div>
    </div>
</template>

<style>
.profile-picture {
    border: solid 2px;
    border-radius: 100%;
    width: 32px;
    height: 32px;
}
.profile-picture img {
    background-color: aquamarine;
}
.profile-picture p {
    margin: auto;
    padding: 5px 0;
    text-align: center;
}
</style>
