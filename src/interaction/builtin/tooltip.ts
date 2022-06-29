import { TooltipInteraction } from '../../spec';
import { createInteraction } from '../create';

export type TooltipOptions = Omit<TooltipInteraction, 'type'>;

export const InteractionDescriptor = (options?: TooltipOptions) => ({
  interactors: [{ type: 'mousePosition' }, { type: 'touchPosition' }],
  start: [
    {
      trigger: 'hover',
      action: [
        { type: 'surfacePointSelection' },
        { type: 'tooltip', ...options },
      ],
      throttle: { wait: 50, leading: true, trailing: false },
    },
    {
      trigger: 'leave',
      action: [
        { type: 'surfacePointSelection' },
        { type: 'tooltip', ...options },
      ],
    },
  ],
});

export const Tooltip = createInteraction<TooltipOptions>(InteractionDescriptor);

Tooltip.props = {};