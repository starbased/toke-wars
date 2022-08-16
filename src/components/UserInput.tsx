import {
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  Spacer,
} from "@chakra-ui/react";
import { getAddress } from "ethers/lib/utils";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

export function UserInput() {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<{ address: string }>();

  const onSubmit = handleSubmit((data) =>
    router.push(`/rewards/${getAddress(data.address)}`, undefined, {
      shallow: true,
    })
  );

  return (
    <form onSubmit={onSubmit}>
      <FormControl isInvalid={!!errors.address}>
        <Flex>
          <Box px="2" minW={425}>
            <Input
              defaultValue={router.query?.address}
              autoFocus
              id="address"
              placeholder="ETH Address"
              {...register("address", {
                required: "This is required",
                minLength: {
                  value: 42,
                  message: "Length should be 42",
                },
              })}
            />
          </Box>
          <Spacer />
          <Button isLoading={isSubmitting} type="submit">
            Submit
          </Button>
        </Flex>
        <FormErrorMessage>
          <Badge colorScheme="red">
            {errors.address && errors.address.message}
          </Badge>
        </FormErrorMessage>
      </FormControl>
    </form>
  );
}
