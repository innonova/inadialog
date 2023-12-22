export const vFocus = {
  mounted: (el: HTMLOrSVGElement) => {
    el.focus();
  }
}

type Timeout = ReturnType<typeof setTimeout>;
type Binding = {
  value: Record<'click' | 'dblclick', (event: MouseEvent) => void | undefined>
}
export const vClickHandler = {
  mounted: (el: HTMLElement, binding: Binding) => {
    let timeout: Timeout | null = null;
    el.addEventListener('click', (event: MouseEvent) => {
      event.stopPropagation();
      if (!timeout) {
        if (binding.value['click']) {
          binding?.value.click(event);
        }
        timeout = setTimeout(() => {
          if (timeout) {
            clearTimeout(timeout)
          };
          timeout = null;
        }, 900);
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = null;
        if (binding.value['dblclick']) {
          binding?.value.dblclick(event);
        }
      }
    });
  }
}