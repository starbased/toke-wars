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
import { useNavigate, useParams } from "react-router-dom";

type Props = {
  setAddress: (address: string) => void;
};

export function UserInput({ setAddress }: Props) {
  const navigate = useNavigate();
  const { address } = useParams();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  function onSubmit(values) {
    const value = values.address.trim();
    try {
      setAddress(getAddress(value).toLowerCase());
    } catch {
      alert("invalid eth address");
    }
    navigate(`/Rewards/${value}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.address}>
        <Flex>
          <Box px="2" minW={425}>
            <Input
              defaultValue={address}
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
