import { getAddress } from "ethers/lib/utils";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocalStorage } from "hooks/useLocalStorage";

export function UserInput() {
  const router = useRouter();
  const [previousAddresses, setPreviousAddresses] = useLocalStorage<string[]>(
    "previousAddresses",
    []
  );

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<{ address: string }>();

  const onSubmit = handleSubmit(({ address }) => {
    if (
      !previousAddresses
        .map((address) => address.toLowerCase())
        .includes(address.toLowerCase())
    ) {
      setPreviousAddresses([...previousAddresses, address]);
    }

    router.push(`/rewards/${getAddress(address)}`);
  });

  return (
    <form onSubmit={onSubmit}>
      <input
        defaultValue={router.query?.address}
        autoFocus
        id="address"
        placeholder="ETH Address"
        className="bg-gray-800 border-gray-600 border p-1 px-2 m-1 rounded-md"
        {...register("address", {
          required: "This is required",
          minLength: {
            value: 42,
            message: "Length should be 42",
          },
        })}
      />

      <button
        type="submit"
        className="border border-gray-600 rounded p-1 ml-1 bg-gray-700"
        style={{ width: "62px" }}
      >
        {isSubmitting ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
        ) : (
          "Submit"
        )}
      </button>
      <div>{errors.address?.message}</div>
    </form>
  );
}
