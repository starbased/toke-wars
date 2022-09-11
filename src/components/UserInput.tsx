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
      <input
        defaultValue={router.query?.address}
        autoFocus
        id="address"
        placeholder="ETH Address"
        className="bg-gray-800 border-gray-600 border p-1 px-2 m-1 rounded-md"
        style={{ minWidth: "410px" }}
        {...register("address", {
          required: "This is required",
          minLength: {
            value: 42,
            message: "Length should be 42",
          },
        })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
