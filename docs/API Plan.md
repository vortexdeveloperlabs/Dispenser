/policy/get

> This will return a list of policies

Post body:

> These let you search for specifc policies

````json
    {
        "hasPolicies": "ChromePolicy/AppleDeviceConfigMDM/WindowsMDM"
    }
    ```

> TODO: Use JSON Schema instead lol

# Dispenser APIs

## `/policy/get`

> This will return a list of policies

Post body:

> These fields let you search for specifc policies

```ts
{
    chromePolicy: string;
}
````

> TODO: Convert to JSON schema
>
> TODO: Use unstable instead of appleflyer

## /cohortInfo/get

> A user may opt to not be displayed in the users field of the Cohort JSON in
> the onboarding process with `ServerUserData.userOptedOutOfPublicAPI` set to
> `true` (on the DB). This doesn't apply if the API was called with a Dispenser
> Access Token (TODO: Link to the definition of this on Filter Lock).

## /serverInfo/get

## /userInfo/get

> A user may opt to not be displayed on here during the onboarding process with
> `ServerUserData.userOptedOutOfPublicAPI` set to `true` (on the DB). This
> doesn't apply if the API was called with a Dispenser Access Token (TODO: Link
> to the definition of this on Filter Lock).
