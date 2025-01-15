<template>
  <pre>{{ sponsoredUsers }}</pre>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: ["app"],
});

const { user } = useSession();
const { getSponsoredUsers, sponsoredUsers } = useSponsored();

await getSponsoredUsers();
</script>
