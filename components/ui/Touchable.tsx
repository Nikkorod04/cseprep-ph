import { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { tapFeedback, type HapticKind } from "@/lib/utils/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const USE_NATIVE = Platform.OS !== "web";

export interface TouchableProps extends Omit<PressableProps, "style"> {
  style?: StyleProp<ViewStyle>;
  /** Scale reached while pressed. Keep subtle for full-width rows. */
  scaleTo?: number;
  haptic?: HapticKind;
}

/**
 * Pressable with a spring scale, a light opacity dip, and optional haptics.
 * Use `scaleTo={1}` for rows where scaling would look noisy.
 */
export function Touchable({
  scaleTo = 0.97,
  haptic = "light",
  style,
  disabled,
  accessibilityRole = "button",
  accessibilityState,
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: TouchableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animate(to: number) {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: USE_NATIVE,
      speed: 50,
      bounciness: 0,
    }).start();
  }

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: Boolean(disabled),
        ...(accessibilityState ?? {}),
      }}
      onPressIn={(event) => {
        if (!disabled) animate(scaleTo);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animate(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        if (!disabled) tapFeedback(haptic);
        onPress?.(event);
      }}
      style={[
        style,
        {
          transform: [{ scale }],
          opacity: scale.interpolate({
            inputRange: [Math.min(scaleTo, 1), 1],
            outputRange: [0.94, 1],
            extrapolate: "clamp",
          }),
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}
