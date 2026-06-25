import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Link, useRouter } from "@tanstack/react-router"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { Eye, EyeClosed } from "lucide-react"

const formSchema = z.object({
	nombre: z.string().min(3, "Nombre mínimo de 3 caracteres."),
	email: z.email("Email inválido"),
	password: z.string().min(8, "Contraseña mínima de 8 caracteres."),
})

export function RegisterForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const form = useForm({
		defaultValues: {
			nombre: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			setLoading(true)
			try {
				await authClient.signUp.email(
					{
						email: value.email,
						password: value.password,
						name: value.nombre,
						callbackURL: "/",
					},
					{
						onSuccess: () => {
							toast.success("Registro exitoso")
							router.navigate({ to: "/" })
						},
						onError: ctx => {
							toast.error(ctx.error.message)
						},
					}
				)
			} catch (error) {
				if (error instanceof Error) {
					toast.error(error.message)
				} else {
					toast.error("Error al registrarse")
				}
			} finally {
				setLoading(false)
			}
		},
	})

	return (
		<div
			className={cn(
				"min-w-1/4 flex flex-col gap-6 w-11/12 sm:w-1/4 2xl:w-1/8 mx-auto",
				className
			)}
			{...props}
		>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Bienvenido a la app</CardTitle>
					<CardDescription>Ingresa con una cuenta de Google</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id="register-form"
						onSubmit={e => {
							e.preventDefault()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							<form.Field
								name="nombre"
								children={field => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={e => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="ruben blada"
												autoComplete="off"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									)
								}}
							/>

							<form.Field
								name="email"
								children={field => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={e => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												placeholder="m@example.com"
												autoComplete="off"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									)
								}}
							/>

							<form.Field
								name="password"
								children={field => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
											<div className="relative">
												<Input
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={e => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="********"
													type={showPassword ? "text" : "password"}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
													aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
												>
													{showPassword ? (
														<EyeClosed size={16} />
													) : (
														<Eye size={16} />
													)}
												</button>
											</div>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									)
								}}
							/>

							<Field>
								<Button type="submit">
									{loading ? "Registrando..." : "Registrar"}
								</Button>
								<FieldDescription className="text-center">
									Ya tienes cuenta ?{" "}
									<Link to="/login" viewTransition={{ types: ["rotateZ"] }}>
										Ingresar
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
