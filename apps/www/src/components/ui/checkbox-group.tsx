import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { cn } from 'tailwind-variants'
import { Checkbox } from '@/components/ui/checkbox'

function CheckboxGroup({ className, ...props }: BaseCheckboxGroup.Props) {
  return (
    <BaseCheckboxGroup
      className={cn('grid gap-3', className)}
      data-slot="checkbox-group"
      {...props}
    />
  )
}

export { Checkbox as CheckboxGroupItem, CheckboxGroup }
