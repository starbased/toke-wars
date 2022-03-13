import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  Input,
  SimpleGrid,
  Spacer,
} from "@chakra-ui/react";
import { getAddress } from "ethers/lib/utils";
import { useForm } from "react-hook-form";

type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  function onSubmit(values) {
    console.log("evt", values.address);

    const value = values.address.trim();
    try {
      setAddress(getAddress(value).toLowerCase());
    } catch {
      alert("invalid eth address");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Center>
        <FormControl isInvalid={errors.address}>
          <Flex>
            <Box px="2">
              <Input
                id="address"
                placeholder="address"
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
            <Box px="2">
              <Button isLoading={isSubmitting} type="submit">
                Submit
              </Button>
            </Box>
          </Flex>
          <FormErrorMessage>
            <Badge colorScheme="red">
              {errors.address && errors.address.message}
            </Badge>
          </FormErrorMessage>
        </FormControl>
      </Center>
    </form>
  );
}
