export default defineAppConfig({
  ui: {
    card: {
        slots: {
            root: '!rounded-3xl',
            body: '!p-4',
        },
    },

    button: {
      slots: {
        base: "disabled:!bg-gray-500",
      },
    },

    formField: {
      slots: {
        error: 'mt-1 text-xs text-red-500',
      },
    },

    input: {
      slots: {
        root: 'block',
      }
    }
  }
})
