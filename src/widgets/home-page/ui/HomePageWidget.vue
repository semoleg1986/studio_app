<template>
  <CourseBuilderWorkspace />
</template>

<script setup lang="ts">
import { CourseBuilderWorkspace } from "~/features/course-builder";
import { useHomePage } from "~/widgets/home-page/model/use-home-page";

useHomePage();
</script>
