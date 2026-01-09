# Keyframes and Animation

Scene inputs can be animated using keyframes to create dynamic changes over time. p5mv interpolates between keyframe values using easing curves, providing smooth transitions for colors, numbers, and other parameters.

## Creating Keyframes

To animate a scene input:

1. Select a region on the timeline
2. Move the playhead to the desired position within the region
3. Set the input value in the Inspector
4. Click the **+** icon to create a keyframe at the current position

## Editing Keyframes

- **Change value** – Move the playhead to a keyframe position and adjust the input
- **Add more keyframes** – Move to a new position and click **+** again
- **Change easing** – Use the easing dropdown to select a curve (linear, ease-in, ease-out, etc.)
- **Delete all keyframes** – Click the eraser icon to reset to static mode

## Easing Curves

p5mv supports various [easing functions](https://easings.net/) functions for smooth animation.